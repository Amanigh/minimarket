const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "t4hp53d3asql",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "-TsZG5xBmT8Dh0fodwpgRp4979AsmaGiHaa0tXWRtdE"
});




// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const checkoutBtn = document.querySelector(".check-out");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");
const closeBtn = document.querySelector(".close-cart");
const removeItem = document.querySelector(".remove-item");




Notiflix.Notify.Init({});

// cart
let cart = [];
let buttonsDOM = [];

//getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries()

      // let result = await fetch('products.json');
      // let data = await result.json();


      let products = contentful.items;
      products = products.map(item => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url
        return {
          title,
          price,
          id,
          image
        }
      })
      return products;

    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    products.forEach(product => {

      let productArticle = document.createElement('article');
      productArticle.innerHTML = `
      <!-- single product -->
<div class="img-container">
  <img src="${product.image}" alt="product" class="product-img">
  <button class="bag-btn" data-id="${product.id}">
    <i class="fas fa-shopping-cart"></i>
    add to cart
  </button>
</div>
<h3>${product.title}</h3>
<h4>$${product.price}</h4>
<!-- end of single product -->

`

      productArticle.className = 'product'
      productDOM.append(productArticle)
    })
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart"
        button.disabled = true;
      }
      button.addEventListener("click", () => {
        button.innerText = "In Cart";
        button.disabled = true;
        // get product from products:
        let cartItem = {
          ...Storage.getProduct(id),
          amount: 1
        };
        // add product to the cart:
        cart = [...cart, cartItem];

        // save cart in local storage:
        Storage.saveCart(cart);

        //set cart values:
        this.setCartValues(cart);

        // display cart items:
        this.addCartItem(cartItem);
        //show alert:
        Notiflix.Notify.Success(`${cartItem.title} successfully added to cart.`);
        // changing amounts:


      })

    })
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;

    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;


  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src="${item.image}" alt="product">
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `

    cartContent.appendChild(div);

  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");

  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  populateCart(cart) {
    cart.forEach(item => {
      this.addCartItem(item)
    })
  }


  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeBtn.addEventListener("click", this.hideCart);
    // console.log(cart);


  }

  cartLogic() {
    // clear cart
    clearCartBtn.addEventListener("click", () => {
      Notiflix.Confirm.Show('Confirmation', 'Do you really want to clear your cart?',
        'Yes',
        'No',
        () => { // Yes button callback
          this.clearCart()
        });
    });
    checkoutBtn.addEventListener("click", () => {
      let currentCart = Storage.getCart();
      if (currentCart.length > 0) {
        Notiflix.Confirm.Show('Confirmation', `Your total is $ ${cartTotal.innerText}`,
          `pay now`,
          'Cancel',
          () => { // Yes button callback
            Notiflix.Report.Success('Thank you for your order!', `Your order number: ${parseInt(Math.random()*1e4)}`, 'OK');
            this.clearCart()
          });
      } else {
        Notiflix.Report.Info('Sorry!', "Your cart is empty!", 'OK');
      }
    });

    // cart functionality
    // remove
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains('remove-item')) {
        this.removeOneItem(event)
      } else if (event.target.classList.contains('fa-chevron-up')) {
        this.increaseAmount(event);

      } else if (event.target.classList.contains('fa-chevron-down')) {
        this.decreaseAmount(event)
      }
    });
  }

  removeOneItem(event) {
    let id = event.target.dataset.id;
    let item = cart.find(item => item.id === id);
    this.removeItem(id);
    let removedItem = cartContent.querySelector(`[data-id="${id}"]`).parentElement.parentElement
    cartContent.removeChild(removedItem);
    Notiflix.Notify.Success(`${item.title} successfully removed from the cart.`);
  }

  increaseAmount(event) {
    let chevronIcon = event.target
    let id = chevronIcon.dataset.id;
    let tempItem = cart.find(item => item.id === id);
    tempItem.amount = tempItem.amount + 1;
    Storage.saveCart(cart);
    this.setCartValues(cart);
    chevronIcon.nextElementSibling.innerText = tempItem.amount
  }

  decreaseAmount(event) {
    let chevronIcon = event.target
    let id = chevronIcon.dataset.id;
    let tempItem = cart.find(item => item.id === id);
    if (tempItem.amount > 1) {
      tempItem.amount = tempItem.amount - 1;


    } else {
      Notiflix.Confirm.Show('Confirmation', `Do you really want to remove ${tempItem.title} from cart?`,
        'Yes',
        'No',
        () => { // Yes button callback
          this.removeOneItem(event);
        });
    }

    Storage.saveCart(cart);
    this.setCartValues(cart);
    chevronIcon.previousElementSibling.innerText = tempItem.amount

  }

  clearCart() {

    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    // delete items from the cartDOM
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();


  }


  removeItem(id) {
    // update cart
    cart = cart.filter(item => item.id !== id);
    console.log(cart);
    this.setCartValues(cart);
    Storage.saveCart(cart);

    // update product button
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to cart`

  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products))
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // get all products
  products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);


  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic()
  })







})