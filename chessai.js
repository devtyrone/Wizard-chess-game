// let greeting = "como estas";
var name = "AYELERU";
var num1 = "2"
var num2 = "4"
// console.log(num1)
// console.log(num2)
// console.log(num1 + num2) 
// console.log(greeting.toUpperCase())
console.log(name.toLowerCase())

function greeting(name){
  console.log("Hello" +" " + name)
}
console.log("Hello" +" " + "Salam")
console.log("Hello" +" " + "Great")
greeting("Sola")
greeting("Sope")

function spanish_greeting(name){
  console.log("Como Estas" + " " + name)
}
spanish_greeting("Salam")
spanish_greeting("Great")

function add(a,b){
  console.log(a + b)
}

add("20","25")
add("Donald","Trump")

function add(x,y){
  console.log(x+y)

}

add("Cocoa", "House")
add("Happy","birthday")

function add(a,b){
  console.log(a-b)
}


add(55,25)
add("200", "50")

function sub(a,b){
  console.log(a*b)
}

sub("5", "5")
sub("20", "20")

function div(a,b){
  console.log(a / b)
}


div("55","25")
div("200", "50")

function root(a,b){
  console.log(a**b)
}

root("5", "25")
root("20", "4")

// Nested Object
const Person = {
  Name: {
  Firstname: "Great",
  Surname: "Ezenewu",
  secondname: "Okechukwu",
},
hobby: "Coding"
}
const myName = Person.Name
console.log(myName.Firstname)
console.log(myName.secondname)
console.log(myName.Surname)
console.log(personalbar.hobby)


//Methods method is a functio of an object or a function imbedded on a object
const Persons = {
  Name: 'Graet',
  class: 'web',
  intro: function (){
  return 'My name is ${this.Nae}, iin class {this.class}'
}    
  
//(Person.intro())
}
console.log(Persons.intro())


const shape = (triangle,base,height) => { //using arrow function
  return{
    triangle,
    base,
    height,
    description: function(){
      return `this is a ${this.triangle} of ${this.base} and ${this.height}`}
    }
  };
const description = shape(10,20,30).description();
console.log(description);
const newl = shape(5,10,15);
console.log(newl.description())

// constructor
//Make use of pascal case
// make use if this variable
//store it in a new variale and introduce the new key words

const Pasalcase =function(type,side1,side2){
  this.type =type
  this.side1 =side1
  this.side2 =side2
  this.statement = function(){return `${this.type}, ${this.side1}, ${this.side2}`}
    return this
}
const newMyshape = new Pasalcase("circle","radius","diameter")
    console.log(newMyshape.statement())

//In-built Javascript Object
  const wordings = "Good morning"
      console.log(wordings.startsWith("G"))
      console.log(wordings.toLocaleLowerCase())
      console.log(wordings.toLocaleUpperCase())


// Math oBJECTare our normal formula that comes with Javascript
console.log(Math.sin(30))
console.log(Math.PI)

//Date Object updates the date every year
const mydate = new Date()
console.log(mydate.getFullYear())
console.log(mydate.getDay())
console.log(mydate.getMonth())
console.log(mydate.getTimezoneOffset())

// Array is a list that stores multiple data
// []- It is denoted with a square bracket called 
// 1. array of string ["great", "tolu"]
// 2. Array of number [1,2,3,4,5]
// 3. arrays of object 
// 4. array of array
//Mixed array
// Array is a zero index formatting that's each list starts from zero



var Score = 80
if (Score >= 70) {
  console.log ("Good boy")
}

else if (score >= 60) {
  console.log ("GOOD")
}
else if (score >= 50) {
  console.log("Average")
}
else if (score >=45) {
  console.log ("NOT GOOD")
}
else if (score >= 40) {
  console.log("Poor")
}
else if (score >= 39) {
  console.log ("fail")
}

else if (score == 29) {
  console.log ("bad")
}

// switch case is used to to set multiple condition, if the condition is not meet it returns to a default

function switchTest (Properties) {
  switch (Properties) {
    case "Tall":
      return "He is tall";
      case "Short":
      return "He is tall";
      case "light":
        return "He is light";
        default: 
        return "I don't know";
  }}
  console.log (switchTest ('light'));

  // Tenary operator

  // (condition)? true:false
  (10%2==2)?console.log (true):console.log (false)

  // Tip calculator for steven
  const bill = 400;
  const tip = bill >= 50 && bill <= 300 ? bill * 0.15 : bill * 0.20;
  console.log('The bill was ${bill, the tip was ${tip}, and the total value $(bill + tip).');


  // loop
  // for loop



//   for( = 0; i < 5; i++){
//     console.log(i);
//   }

//   // while
//   let i=0
//   while(i<=5){
//     console.log(i)
//     i++
//   }

// // do while loop
  
//   do {
//     console.log(i)
//     i++}
//     while(i<5)
  
// for of loop
// it is used to interact the element of an array
let i = [1,2,3,4,5]
for (el of i) {console.log(i)}

// for in loop is used to get the key of an object
let forInl = {
      person: 'Great',
      town: 'Ibadan',
      country: 'Nigeria'
}
for (key in forInl) {console.log (key) }
console.log(forInl.person)
console.log(forInl.town)
console.log(forInl.country)

