const orderButton = document.querySelector('[data-order]')
const orderDialog = document.querySelector('dialog')

orderButton.addEventListener('click', () => orderDialog.showModal())
