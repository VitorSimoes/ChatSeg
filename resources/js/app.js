/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */
require('./bootstrap');
import Vue from 'vue';
import axios from 'axios';

Vue.component('chat-messages', require('./components/ChatMessages.vue').default);
Vue.component('chat-form', require('./components/ChatForm.vue').default);

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const NodeRSA = require('node-rsa');
const CryptoJS = require("crypto-js");
const key = new NodeRSA();

const app = new Vue({
    el: '#app',
    data: {
        messages: [], keyDES: "",
    },

    created() {
        key.generateKeyPair();
        key.setOptions('sha1');
        this.sendKey(key.exportKey('public'));
        this.fetchMessages();
        Echo.private('chat')
            .listen('MessageSent', (e) => {
                this.messages.push({
                    message:CryptoJS.TripleDES.decrypt(e.message.message, this.keyDES).toString(CryptoJS.enc.Utf8),
                    user: e.user
                });
            });
    },

    methods: {
        fetchMessages() {
            axios.get('/messages').then(response => {
                response.data.map(item => {
                    item.message=CryptoJS.TripleDES.decrypt(item.message, this.keyDES).toString(CryptoJS.enc.Utf8);
                });
                this.messages = response.data;
            });
        },

        sendKey(key_public) {
            let key2 = {'public_key': key_public};
            axios.post('/key', key2).then(response => {
                this.keyDES = key.decrypt(response.data, 'utf8');
            });
        },

        addMessage(message) {
            console.log(message);
            this.messages.push(message);
            var ciphertext = CryptoJS.TripleDES.encrypt(message.message, this.keyDES);
            var  mes={'mes':ciphertext.toString()};
            axios.post('/messages', mes).then(response => {
                console.log(response.data);
            });
        }
    }
});
