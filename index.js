const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = async () => {
    // define your method to get cart data
    try {
      const response = await fetch(`${URL}/cart`);
      if (!response.ok) {
        console.error("fetch fail");
        throw new Error('Failed to fetch cart data');
      }
      return response.json();
    } catch (error) {
      console.log('Error fetch cart:', error);
      return [];
    }
  };

  const getInventory = async () => {
    // define your method to get inventory dat
    try {
      const response = await fetch(`${URL}/inventory`);
      if (!response.ok) {
        console.error("fetch fail");
        throw new Error('Failed to fetch inventory data');
      }
      return response.json();
    } catch (error) {
      console.log('Error fetch inventory:', error);
      return [];
    }
  };

  const addToCart = async (itemName, itemId, itemAmount) => {
    // define your method to add an item to cart
    try {
      // Check if item already exists in cart
      const cart = await API.getCart();

      const existingItem = cart.find(item => item.itemId === itemId);
      if (existingItem) {
        //console.log(existingItem);
        // If item exists, update its amount
        const updatedAmount = existingItem.itemAmount + itemAmount;
        const response = await fetch(`${URL}/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemAmount: updatedAmount })
        });
        if (!response.ok) {
          console.error('Failed to update item in cart:', response.statusText);
          return null;
        }

      } else {
        // If item does not exist, add new item to cart
        const response = await fetch(`${URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName, itemId, itemAmount })
        });
        if (!response.ok) {
          console.error('Failed to add item to cart:', response.statusText);
          return null;
        }
      }
      const updatedCart = await API.getCart();
      const updatedItem = cart.find(item => item.itemId === itemId);
      const newlyAddedItem = updatedCart.find(item => item.itemId === itemId);

      const inventoryItem = {
        id: newlyAddedItem.itemId,
        itemName: itemName,
        itemAmount: newlyAddedItem.itemAmount
      };
      // console.log(newlyAddedItem);
      return newlyAddedItem;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return null;
    }
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
  };

  const deleteFromCart = async (itemId) => {
    // define your method to delete an item in cart
    console.log("111111")
    //console.log(fetch(`${URL}/cart/${itemId}`));
    try {
      const response = await fetch(`${URL}/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to delete item from cart:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting item from cart:', error);
      return false;
    }
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
    }

    subscribe(cb) { }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const renderInventory = (inventory) => {
    const inventoryItems = document.querySelector(".inventory-items");
    inventoryItems.innerHTML = "";
    inventory.forEach((item) => {
      const li = document.createElement("li");
      li.className = "inventory-item";
      li.dataset.id = item.id;
      li.innerHTML = `
              <p>${item.content}</p>
              <button class="delete-btn">-</button>
              <span>1</span>
              <button class="add-btn">+</button>
              <button class="add-cart-btn">add to cart</button>
          `;
      inventoryItems.appendChild(li);
    });
  }

  const renderCart = (cart) => {
    const cartItems = document.querySelector(".cart-items");
    cartItems.innerHTML = "";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      const itemName = item.itemName;
      const itemAmount = item.itemAmount;
      const itemId = item.id;
      li.dataset.id = itemId;
      li.innerHTML = `
              <span>${itemName} * ${itemAmount}</span>
              <button class="delete-item-btn">delete</button>
          `;
      cartItems.appendChild(li);
    });
  }
  return {
    renderInventory,
    renderCart
  };

  const renderCartUpdateItem = (cart) => {
    const cartItems = document.querySelector(".cart-items");

  }
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = async () => {
    // initialize render
    await fetchData();
    render();
    setupEventListeners();
  };

  const fetchData = async () => {
    const inventory = await API.getInventory();
    const cart = await API.getCart();
    // console.log("hello");
    //console.log(inventory);
    //console.log(cart);
    state.inventory = inventory;
    // console.log(state.inventory);
    state.cart = cart;
  }

  const render = () => {
    view.renderInventory(state.inventory);
    view.renderCart(state.cart);
  }

  const setupEventListeners = () => {
    const inventoryItems = document.querySelector(".inventory-items");
    const cartItems = document.querySelector(".cart-items");
    inventoryItems.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("add-btn")) {
        handleUpdateAmount(target.parentElement);
      } else if (target.classList.contains("delete-btn")) {
        handleDelete(target.parentElement);
      } else if (target.classList.contains("add-cart-btn")) {
        const itemElement = target.parentElement;
        const itemId = target.parentElement.dataset.id;
        const itemAmount = parseInt(itemElement.querySelector("span").textContent);
        const itemName = itemElement.querySelector("p").textContent;
        const cartUpdateItem = await API.addToCart(itemName, itemId, itemAmount);
        if (cartUpdateItem) {
          let flag = true;
          state.cart.forEach((item) => {
            if (item.itemId === cartUpdateItem.itemId) {
              item.itemAmount = cartUpdateItem.itemAmount;
              flag = false;
            }
          });
          if (flag) {
            state.cart.push(cartUpdateItem);
          }

        }
        view.renderCart(state.cart);
      }
    });

    cartItems.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("delete-item-btn")) {
        // console.log("delete button detect");
        const itemElement = target.parentElement;
        const itemId = itemElement.dataset.id;
        console.log(`11111 : ${itemElement.dataset}`);
        const status = await API.deleteFromCart(itemId);
        console.log(`status : ${status}`);

        state.cart = state.cart.filter(item => item.itemId !== itemId);
        view.renderCart(state.cart);

      }
    });
  }

  const handleUpdateAmount = (itemElement) => {
    const quantitySpan = itemElement.querySelector("span");
    let quantity = parseInt(quantitySpan.textContent);
    quantity++;
    quantitySpan.textContent = quantity;
  };

  const handleDelete = (itemElement) => {
    const quantitySpan = itemElement.querySelector("span");
    let quantity = parseInt(quantitySpan.textContent);
    if (quantity > 1) {
      quantity--;
      quantitySpan.textContent = quantity;
    }
  };

  const handleAddToCart = () => { };


  const handleCheckout = () => { };
  const bootstrap = () => {
    init();
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
