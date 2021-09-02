//console.log(arguments);
console.log(require("module").wrapper);


class Calculater{

add(a,b){
  return  a+b;
}

multiply(a,b){
    return  a*b;
  }
  

}

module.exports=Calculater;