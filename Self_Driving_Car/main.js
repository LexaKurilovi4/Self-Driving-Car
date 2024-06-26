const car_canvas=document.getElementById("car_canvas");
car_canvas.width=200;
const network_canvas=document.getElementById("network_canvas");
network_canvas.width=300;

const carcontext = car_canvas.getContext("2d");
const networkcontext = network_canvas.getContext("2d");

const road=new Road(car_canvas.width/2,car_canvas.width*0.9);

const N=100;
const cars=generateCars(N);
let bestCar=cars[0];
if(localStorage.getItem("best")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("best"));
        if(i!=0){
            Neural_Network.mutate(cars[i].brain,0.1);
        }
    }
}

const car_traffic=[
    new Car(road.getLane_Center(1),-100,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(0),-300,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(2),-300,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(0),-500,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(1),-500,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(1),-700,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(2),-700,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(0),-900,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(2),-1100,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(0),-1100,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(1),-1300,30,50,"RainbowCar",2,getRandomColor()),
    new Car(road.getLane_Center(0),-1300,30,50,"RainbowCar",2,getRandomColor()),
];

animatION();

function save(){
    localStorage.setItem("best",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("best"); 
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLane_Center(1),100,30,50,"AI"));
    }
    return cars;
}

function animatION(time){
    for(let i=0;i<car_traffic.length;i++){
        car_traffic[i].update_img(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update_img(road.borders,car_traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    car_canvas.height=window.innerHeight;
    network_canvas.height=window.innerHeight;

    carcontext.save();
    carcontext.translate(0,-bestCar.y+car_canvas.height*0.7);

    road.draw(carcontext);
    for(let i=0;i<car_traffic.length;i++){
        car_traffic[i].draw(carcontext);
    }
    carcontext.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carcontext);
    }
    carcontext.globalAlpha=1;
    bestCar.draw(carcontext,true);

    carcontext.restore();

    networkcontext.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkcontext,bestCar.brain);
    requestAnimationFrame(animatION);
}