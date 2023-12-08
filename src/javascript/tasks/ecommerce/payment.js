(function () {
    "use strict";

    const user = {
        form: null,

        onFormSubmit: function (e) {
            e.preventDefault();
            if (this.form) {
                let formData = new FormData(this.form);

                let userInfo = Object.fromEntries(formData);

                if (this.methods.isValid(userInfo)) {
                    this.payment(userInfo);
                    this.methods.storeToLocalStorage(userInfo);
                }
            }
        },

        payment: function (userInfo) {
            const price = this.methods.totalAmount();

            const options = {
                "key": "rzp_test_LUkXnMHYeQNGFM",
                "amount": `${price * 100}`,
                "currency": "INR",
                "name": "Acme Corp",
                "description": "Test Transaction",
                "image": "https://example.com/your_logo",
                // "order_id": "order_N9rcYdAauUlFa7", 
                "handler": function (response) {
                    if (response.razorpay_payment_id) {
                        const orderDetails = {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id
                        }
                        localStorage.setItem('orderDetails', JSON.stringify([orderDetails]));
                        window.location.href = "http://127.0.0.1:5501/src/javascript/tasks/ecommerce/orderSummary.html";
                    }
                },
                "prefill": {
                    "name": `${userInfo.firstName} ${userInfo.lastName}`,
                    "email": "gaurav.kumar@example.com",
                    "contact": `${userInfo.phone}`
                },
                "notes": {
                    "address": "Razorpay Corporate Office"
                },
                "theme": {
                    "color": "#3399cc"
                }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                console.error('Payment Failed! Please Try Again.');
            });

            document.getElementById('rzp-button1').onclick = function (e) {
                rzp1.open();
                e.preventDefault();
            }
        },

        bind: function () {
            this.form = document.querySelector('#js-user');
            if (this.form) {
                this.form.addEventListener('submit', this.onFormSubmit.bind(this));
            }
        },

        methods: {
            storeToLocalStorage: function (product) {
                try {
                    return localStorage.setItem('userInfo', JSON.stringify(product));
                } catch (error) {
                    throw new Error('Unable to store data in LocalStorage!')
                }
            },

            getFromLocalStorage: function () {
                try {
                    return JSON.parse(localStorage.getItem('priceToPay')) || [];
                } catch (error) {
                    throw new Error('Unable to fetch data from LocalStorage!');
                }
            },

            totalAmount: function () {
                const getAmountFromLocalStorage = this.getFromLocalStorage();
                const amount = getAmountFromLocalStorage[0].amount;
                return amount;
            },

            isValid: function (data) {
                const errors = {};

                let firstName, lastName, city, state, zip, phone, address;
                [firstName, lastName, city, state, zip, phone, address] = [data.firstName.trim(), data.lastName.trim(), data.city.trim(), data.state.trim(), data.zip.trim(), data.phone.trim(), data.address.trim()];

                //validate firstname
                if (firstName === '' || firstName == null) {
                    errors.firstName = 'Please Enter Your First Name';
                } else if (!(firstName.match(/^[A-Za-z]+$/))) {
                    errors.firstName = 'Name should only be an alphabet';
                } else if (firstName.length < 3 || firstName.length > 50) {
                    errors.firstName = 'First name must be between 3 and 50 characters.';
                } else {
                    errors.firstName = '';
                }
                this.setError('js-errorFirstName', errors.firstName);

                //validate lastName
                if (lastName === '' || lastName == null) {
                    errors.lastName = 'Please Enter Your Last Name';
                } else if (!(lastName.match(/^[A-Za-z]+$/))) {
                    errors.lastName = 'Name should only be an alphabet';
                } else if (lastName.length < 2 || lastName.length > 50) {
                    errors.lastName = 'Last name must be between 2 and 50 characters.';
                } else {
                    errors.lastName = '';
                }
                this.setError('js-errorLastName', errors.lastName);

                // validate city
                if (city === '' || city == null) {
                    errors.city = 'Please Enter Your City Name';
                } else if (!(city.match(/^[A-Za-z\s]+$/))) {
                    errors.city = 'Invalid City Name.';
                } else if (city.length < 2) {
                    errors.city = 'Invalid City Name';
                } else {
                    errors.city = '';
                }
                this.setError('js-errorCity', errors.city);

                // validate State
                if (state === '' || state == null) {
                    errors.state = 'Please Enter Your State';
                } else if (!(state.match(/^[A-Za-z]+$/))) {
                    errors.state = 'Invalid State Name.';
                } else if (state.length < 2) {
                    errors.state = 'Invalid State Name';
                } else {
                    errors.state = '';
                }
                this.setError('js-errorState', errors.state);

                // validate zip
                if (zip === '' || zip == null) {
                    errors.zip = 'Please Enter Your Zip Code';
                } else if (!(/^[1-9][0-9]{5}$/).test(zip)) {
                    errors.zip = 'Invalid Zip Code';
                } else {
                    errors.zip = '';
                }
                this.setError('js-errorZip', errors.zip);

                // validate phone
                if (phone === '' || phone == null) {
                    errors.phone = 'Please Enter your Phone Number.';
                } else if (!phone.match(/^(0|91)?[6-9][0-9]{9}$/)) {
                    errors.phone = 'Invalid Phone Number';
                } else {
                    errors.phone = '';
                }
                this.setError('js-errorPhone', errors.phone);

                // validate address
                if (address === '' || address == null) {
                    errors.address = 'Please Enter Your Address.';
                } else if (address.length < 3) {
                    errors.address = 'Invalid Address';
                } else if (!(/^[A-Za-z0-9\s,#&()/.-]+$/).test(address)) {
                    errors.address = 'Invalid characters in the address';
                } else {
                    errors.address = '';
                }
                this.setError('js-errorAddress', errors.address);

                const hasErrors = Object.values(errors).some(error => error !== '');
                return !hasErrors;
            },

            setError: function (id, error) {
                let element = document.getElementById(id);
                element.innerHTML = error;
            }
        },

        init: function () {
            this.bind();
        }
    }

    user.init();

})();
