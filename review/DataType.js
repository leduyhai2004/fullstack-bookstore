let name = "Sagar";
let age = 25;
let price = 100.50;
let isStudent = true;
let address = null;
let job = undefined;

// Object
let person = {
    name: "Sagar",
    age: 25,
    isStudent: true,
    address: null,
    job: undefined
}

// Array
let fruits = ["Apple", "Banana", "Cherry"];

// Function
function greet(name) {
    console.log("Hello", name);
}

// Class
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}

// Map
let map = new Map();
map.set("name", "Sagar");
map.set("age", 25);
map.set("isStudent", true);
map.set("address", null);
map.set("job", undefined);

// Set
let set = new Set();
set.add("Apple");
set.add("Banana");
set.add("Cherry");

// Symbol
let symbol = Symbol("name");

// BigInt
let bigInt = 1234567890123456789012345678901234567890n;

// Date
let date = new Date();

// RegExp
let regExp = new RegExp("name");