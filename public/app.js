document.addEventListener('DOMContentLoaded', function () {
  M.Tabs.init(document.querySelectorAll('.tabs'))
  M.Sidenav.init(document.querySelectorAll('.sidenav'))
})

// Function helper
const toCurrency = price =>
  new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(price)

const toDate = date => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

const $cart = document.querySelector('#cart')
if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const id = event.target.dataset.id
      const csrf = event.target.dataset.csrf
      fetch('/cart/remove/' + id, {
        headers: {
          'CSRF-Token': csrf
        },
        method: 'delete'
      })
        .then(res => res.json())
        .then(cart => {
          console.log('cart: ', cart)
          if (cart.courses.length) {
            const html = cart.courses
              .map(c => {
                return `
              <tr>
                <td>${c.title}</td>
                <td>${c.price}</td>
                <td>${c.count}</td>
                <td>
                  <button
                    class='btn btn-primary js-remove' 
                    data-id='${c.id}'
                    data-csrf='${cart.csrf}'
                  >Удалить</button>
                </td>
              </tr>`
              })
              .join('')
            $cart.querySelector('tbody').innerHTML = html
            $cart.querySelector('.price').textContent = toCurrency(cart.price)
          } else {
            $cart.innerHTML = `<p>Корзина пуста</p>`
          }
        })
    }
  })
}

document.addEventListener('keyup', event => {
  const {shiftKey, ctrlKey, key} = event
  // Ctrl + Shift + 'L'
  if (shiftKey && ctrlKey && key.toLowerCase() === 'l') {
    toggleTheme()
  }
})

const switchBtn = document.querySelector('#switch')
switchBtn.addEventListener('click', () => {
  toggleTheme()
})
function setTheme(themeName) {
  localStorage.setItem('theme', themeName)
  document.documentElement.className = themeName
}

function toggleTheme() {
  if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-light')
    switchBtn.classList.add('active')
  } else {
    setTheme('theme-dark')
    switchBtn.classList.remove('active')
  }
}

;(function () {
  if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-dark')
    switchBtn.classList.remove('active')
  } else {
    setTheme('theme-light')
    switchBtn.classList.add('active')
  }
})()
