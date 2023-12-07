(function () {
    "use strict";

    const products = {
        baseURL: 'https://dummyjson.com/products',

        fetchProducts: async function (url) {
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                const endpoint = (url || `${this.baseURL}`);
                const response = await fetch(endpoint, { signal });

                setTimeout(() => { controller.abort() }, 2000);

                if (response.ok) {
                    const result = await response.json();

                    return { data: result.products }
                }

            } catch (error) {
                throw new Error('Something Went Wrong while Fetching Products. Please Try Again.');
            }
        },

        debounce: function (func, delay) {
            let debounceTimer;
            return function (...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { func.apply(this, args) }, delay);
            }
        },

        addToCart: async function (productId) {
            try {
                const response = await fetch(`${this.baseURL}/${productId}`);
                if (response.ok) {
                    const product = await response.json();

                    const products = await this.methods.getFromLocalStorage();

                    const existingProduct = products.find((item) => item.id === product.id);

                    if (!existingProduct) {
                        product.quantity = 1;
                        await products.push(product);
                        this.methods.storeToLocalStorage(products);
                    }
                }
            } catch (error) {
                console.error('Error adding product to cart:', error.message);
            }
        },

        cartCount: function () {
            const cartCount = document.querySelector('#js-cartCount');
            const products = this.methods.getFromLocalStorage();
            cartCount.innerHTML = products.length;
        },

        render: function (productsList) {
            const productsListing = document.querySelector('#js-products');
            let productMarkup = '';

            productsList.forEach((product) => {
                const discountedPrice = product.price - (product.price * (product.discountPercentage / 100));

                productMarkup += `<li data-id="${product.id}"
                                class=" hover:shadow-md hover:shadow-gray-400 rounded-lg  cursor-pointer">
                                <!-- image -->
                                <div class=" w-full h-40">
                                    <img class="w-full h-full object-contain" src=${product.thumbnail}
                                        alt="Product Image">
                                </div>

                                <!--description -->
                                <div class="p-4 space-y-2">
                                    <h2 class="line-clamp-2 font-medium text-lg">${product.title}</h2>
                                    <!-- rating -->
                                    <div class="flex py-1 justify-center items-center rounded-sm space-x-1 bg-green-700 text-white w-14">
                                        <span class="text-sm  ">${product.rating}</span>
                                        <svg class="w-4 h-4 "
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path
                                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
                                                </path>
                                            </svg>
                                    </div>

                                    <!-- price -->
                                    <div class="flex space-x-2 items-center"><span class="font-semibold text-xl ">&#8377;${discountedPrice.toFixed(2)}</span>
                                        <span class="text-gray-500 line-through">&#8377;${Number(product.price)}</span>
                                        <div class="text-green-700 font-medium text-sm"><span>${product.discountPercentage}%</span> <span>off</span></div>
                                    </div>

                                    <!-- Add To Cart -->
                                    <button type="button" class="js-addToCartBtn bg-blue-600 text-white w-full py-2 rounded-md" aria-label="Add To Cart">Add To Cart</button>
                                </div>
                            </li>`;
            })
            productsListing.innerHTML = productMarkup;
        },

        methods: {
            getFromLocalStorage: function () {
                try {
                    return JSON.parse(localStorage.getItem('cartProducts')) || [];
                } catch (error) {
                    throw new Error('Unable to fetch data from LocalStorage!');
                }
            },

            storeToLocalStorage: function (product) {
                try {
                    return localStorage.setItem('cartProducts', JSON.stringify(product));
                } catch (error) {
                    throw new Error('Unable to store data in LocalStorage!')
                }
            },
        },

        bind: function () {
            const searchInput = document.querySelector('#js-searchInput');
            const searchListing = document.querySelector('#js-searchList');
            const productsListing = document.querySelector('#js-products');

            if (searchInput) {
                const search = this.debounce(async (searchValues) => {
                    try {
                        const response = await fetch(`${this.baseURL}/search?q=${searchValues}`);
                        if (response.ok) {
                            const data = await response.json();
                            this.render(data.products);
                        }
                    } catch (error) {
                        throw new Error('Something Went Wrong While Searching Products');
                    }
                }, 350)
                searchInput.addEventListener('input', () => search(searchInput.value.trim()));
            }

            // hide searchlist on click anywhere on screen
            document.addEventListener('click', (e) => {
                const target = e.target;

                if (!searchInput.contains(target) && !searchListing.contains(target)) {
                    searchListing.innerHTML = '';
                    searchInput.value = '';
                }
            })

            searchListing.addEventListener('click', (e) => {
                const selectedProduct = e.target.closest('li').querySelector('span');
                if (selectedProduct) {
                    searchInput.value = selectedProduct.innerHTML;
                }
            })

            // Add to cart
            if (productsListing) {
                productsListing.addEventListener('click', (e) => {
                    const addToCartBtn = e.target.closest('.js-addToCartBtn');
                    if (addToCartBtn) {
                        const targetedProduct = addToCartBtn.closest('LI');
                        const productId = targetedProduct.dataset.id;
                        this.addToCart(productId);
                        this.cartCount();
                    }
                })
            }
        },

        init: async function () {
            // fetching products
            const response = await this.fetchProducts(`${this.baseURL}`);
            this.render(response.data);

            this.bind();
        }
    }
    products.init();
})()