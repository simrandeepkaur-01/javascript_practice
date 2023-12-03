(function () {
    const addNewProduct = {

        addProductDialog: document.querySelector('#js_addProductDialog'),
        showDialog: document.querySelector('#js_showDialog'),
        closeDialog: document.querySelector('#js_closeDialog'),

        renderForm: function () {
            this.showDialog.addEventListener('click', () => {
                this.addProductDialog.showModal();
            })

            this.closeDialog.addEventListener('click', () => {
                this.addProductDialog.close();
            })

            this.previewUploadedImages();
        },

        previewUploadedImages: function () {
            const files = document.querySelector('#js_images');
            const previewContainer = document.querySelector('#js_previewImages');

            files.addEventListener('change', (event) => {
                const uploadedFiles = files.files;
                for (file of uploadedFiles) {
                    const reader = new FileReader();

                    reader.addEventListener('load', function (e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'w-16 h-16';
                        previewContainer.appendChild(img);
                    });
                    reader.readAsDataURL(file);
                }
            })
        },

        onFormSubmit: function () {
            const form = document.querySelector('#js_addProduct');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(form);

                    formData.append('discountPercentage', formData.get('discountPercentage').toString());

                    const newProduct = Object.fromEntries(formData);
                    const response = await products.postProducts("https://dummyjson.com/products/add", newProduct);

                    window.location.href = './index.html';

                    return {
                        data: response,
                        error: null
                    }
                } catch (error) {
                    console.error('Something Went Wrong While Posting Data.');
                    return {
                        data: null,
                        error: 'Something Went Wrong While Posting Data.'
                    }
                }
            })
        }
    };

    const products = {
        render: function (productsFromLocalStorage) {
            const productsContainer = document.querySelector('#js_products');
            let products = '';

            productsFromLocalStorage.forEach((product) => {
                const discountedPrice = product.price - (product.price * (product.discountPercentage / 100));

                products += `<li data-id="${product.id}"
                                class=" w-80 hover:shadow-md hover:shadow-gray-400 rounded-lg  flex justify-center items-center flex-col cursor-pointer pt-4 h-[400px]" >
                                <!-- image -->
                                <div class=" w-56 h-56">
                                    <img class="w-full h-full object-fill" src=${product.thumbnail}
                                        alt="Product Image">
                                </div>

                                <!--description -->
                                <div class="p-4 space-y-2">
                                    <h2 class="line-clamp-2">${product.title}</h2>
                                    <!-- rating -->
                                    <div class="flex gap-2">
                                        <div class="bg-green-700 text-white pl-2  py-0.5 rounded-sm text-sm relative w-14 ">${product.rating}
                                            <svg class="w-4 h-4 text-white absolute bottom-0 right-1 top-1/2 -translate-y-1/2"
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path
                                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
                                                </path>
                                            </svg>
                                        </div>
                                        
                                    </div>

                                    <!-- price -->
                                    <div class="flex space-x-2 items-center"><span class="font-semibold">&#8377;${discountedPrice.toFixed(2)}</span>
                                        <span class="text-gray-500 line-through">&#8377;${Number(product.price)}</span>
                                        <div class="text-green-700 font-medium text-sm"><span>${product.discountPercentage}%</span> <span>off</span></div>
                                    </div>
                                </div>
                            </li>`;
            })
            productsContainer.innerHTML = products;

        },

        fetchProducts: async function (url) {
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    console.error("HTTP-Error: " + response.status);
                    return {
                        data: null,
                        error: "Something went wrong. Try again!",
                    }
                }

                const result = await response.json();
                return {
                    data: result.products,
                    error: null
                }

            } catch (error) {
                console.error("HTTP-Error: " + response.status);
                return {
                    data: null,
                    error: "HTTP-Error: " + response.status,
                }
            }
        },

        postProducts: async function (url, data) {
            try {
                const postUrl = url || 'https://dummyjson.com/products/add';

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data),
                };

                let response = await fetch(postUrl, options);

                if (!response.ok) {
                    console.error("HTTP-Error: " + response.status);
                    return {
                        data: null,
                        error: "Something went wrong. Try again!",
                    }
                }

                const newProduct = await response.json();

                const localStorageData = await this.getFromLocalStorage();
                await localStorageData.push(newProduct);
                this.storeToLocalStorage(localStorageData);

                return {
                    data: newProduct,
                    error: null
                }

            } catch (error) {
                console.error("HTTP-Error: " + response.status);
                return {
                    data: null,
                    error: "HTTP-Error: " + response.status,
                }
            }
        },

        debounce: function (func, delay) {
            let debounceTimer;
            return function (...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { func.apply(this, args) }, delay);
            }
        },

        search: function () {
            const searchInput = document.querySelector('#js_searchInput');

            const debouncedSearch = this.debounce(async (searchValues) => {
                try {
                    const response = await fetch(`https://dummyjson.com/products/search?q=${searchValues}`);
                    if (response.ok) {
                        const data = await response.json();
                        this.renderSearch(data.products);
                        return {
                            data: data.products,
                            error: null
                        }
                    }
                } catch (error) {
                    console.error('Something went wrong while searching products!');
                    return {
                        data: null,
                        error: 'Something went wrong while searching products!'
                    }
                }
            }, 300);

            searchInput.addEventListener('input', () => debouncedSearch(searchInput.value.trim()));
        },

        renderSearch: function (product) {
            const searchProductContainer = document.querySelector('#js_searchProduct');

            let searchedProducts = '';

            product.forEach((product) => {
                searchedProducts += `<li data-id='${product.id}' class='py-2 px-2.5 cursor-pointer flex items-center hover:bg-[#f2f5fa] dark:bg-gray-300 dark:hover:bg-slate-200 dark:border-b dark:border-gray-200 font-medium'>
                <img src='${product.thumbnail}' class="mr-2 h-11 w-9">
                <span class="line-clamp-2">${product.title}</span></li>`;
            });

            searchProductContainer.innerHTML = searchedProducts;

            searchProductContainer.addEventListener('click', (e) => {
                const productId = e.target.closest('LI').dataset.id;

                window.location.href = `productDescription.html?id=${productId}`;
            });

        },

        productCategories: function () {
            try {
                const categories = document.querySelector('#js_productCategories');

                categories.addEventListener('change', async (e) => {
                    const selectedCategory = e.target.value;

                    if (selectedCategory === 'all') {
                        const data = this.getFromLocalStorage();
                        this.render(data);
                        return {
                            data: data,
                            error: null
                        }
                    }

                    const categoryUrl = `https://dummyjson.com/products/category/${selectedCategory}`;
                    const response = await fetch(categoryUrl);
                    if (response.ok) {
                        const data = await response.json();
                        this.render(data.products);
                        return {
                            data: data.products,
                            error: null
                        }
                    }
                })
            } catch (error) {
                return {
                    data: null,
                    error: ('Error While Fetching Data :' + error)
                }
            }
        },

        productDescription: function () {
            const productsContainer = document.querySelector('#js_products');

            productsContainer.addEventListener('click', (e) => {
                const product = e.target.closest('LI');

                if (product) {
                    const id = product.dataset.id;
                    window.location.href = `productDescription.html?id=${id}`;
                }
            })
        },

        storeToLocalStorage: function (param) {
            return localStorage.setItem('products', JSON.stringify(param));
        },

        getFromLocalStorage: function () {
            try {
                return JSON.parse(localStorage.getItem('products')) || [];
            } catch (error) {
                console.error('Error parsing JSON from localStorage:', error);
                return [];
            }
        },

        setError: function () {
            console.error('Something went wrong!');
        },

        init: async function () {
            const data = products.getFromLocalStorage()
            if (!data.length) {
                const response = await products.fetchProducts("https://dummyjson.com/products");
                products.storeToLocalStorage(response.data);
            }
            products.render(products.getFromLocalStorage());

            products.productCategories();
            products.productDescription();
            products.search();

            addNewProduct.renderForm();
            addNewProduct.onFormSubmit();

        }
    }

    products.init();
})()