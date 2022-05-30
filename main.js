const carCanvas = document.getElementById('carCanvas')
carCanvas.width = 200
const networkCanvas = document.getElementById('networkCanvas')
networkCanvas.width = 400

const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')
const road = new Road(carCanvas.width/2, carCanvas.width*0.9)

const numberOfCars = 500
const cars = generateCars(numberOfCars)
let bestCar = cars[0]
let brain


if(localStorage.getItem('bestBrain')){
    brain = localStorage.getItem('bestBrain')
} else {
    brain = "{\"levels\":[{\"inputs\":[0.09185424377127871,0,0,0,0.6993904508909092],\"outputs\":[1,1,0,1,1,0],\"biases\":[-0.28910695479007714,0.09781769673002491,0.645455547674263,-0.3571990567583776,-0.34479724946782897,0.8296344642538654],\"weights\":[[-0.38948376425410836,-0.18816665266074512,0.3316133729919841,-0.3650196974588503,0.4336771574127397,0.11248438102785402],[0.08653509236519019,-0.46986590574383835,0.08100718098710838,-0.12902148039693084,0.04263351178249173,0.21005999013890217],[-0.1885516453729701,-0.6107562513863345,-0.026455459463191486,0.5064026913892671,0.24718628557098477,0.34227395084528356],[-0.54931895435256,-0.09565078627782127,0.16013399369303755,-0.25564773116234357,-0.3969975731840716,-0.4763512069003072],[0.015094456755119764,0.566547907012437,0.0739409785670844,-0.30963299810745387,-0.09242269637803668,0.31028927830057706]]},{\"inputs\":[1,1,0,1,1,0],\"outputs\":[1,1,1,0],\"biases\":[-0.4906668547874218,0.09862835564885793,-0.18943349142264587,0.40672260659231035],\"weights\":[[-0.26183655595437993,0.24218436998411647,0.5304927284159164,-0.29901664733139843],[-0.3528745063143625,0.2635683032628819,-0.2834214702070531,0.3050900966668953],[0.38629135259225295,-0.18460482702519723,-0.1781852458558325,0.020808977322157418],[0.46127837669239097,-0.2881496061860313,-0.0745241234980576,0.11741285636140793],[0.46996675453914916,0.050420195675371454,-0.056375763836295126,-0.08231413228104946],[-0.287570620879239,0.36767679945410275,-0.7444174260149319,-0.6838013999365914]]}]}"
}

for(let i = 0; i < cars.length; i++){
    cars[i].brain = JSON.parse(
        brain)
    if(i != 0) {
        NeuralNetwork.mutate(cars[i].brain, 0.1)
    }
}

const trafficLength = 200
let traffic = []

for(let i = 0; i < trafficLength; i++) {
    traffic.push(new Car(road.getLaneCenter(
        Math.floor((Math.random() * 3))), // X
        Math.floor((Math.random() * 3) + 1 * (i * -200)), // Y
        30, // Width
        50, // Length
        "DUMMY", // Control Type
        2 // Max Speed
    ))
}




function save() {
    localStorage.setItem('bestBrain',
        JSON.stringify(bestCar.brain))
}

function discard() {
    localStorage.removeItem('bestBrain')
}

function generateCars(n) {
    const cars = []
    for(let i = 1; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, 'AI', 8))
    }
    return cars
}


function animate(time) {

    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders,[])
    }

    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic)
    }

    bestCar = cars.find(
        c => c.y == Math.min(...cars.map(c => c.y))
    )

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save()
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7)
    
    road.draw(carCtx)
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, 'red')
    }

    carCtx.globalAlpha = 0.2
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, 'blue')
    }
    carCtx.globalAlpha = 1
    bestCar.draw(carCtx, 'blue', true)

    carCtx.restore()

    networkCtx.lineDashOffset = -time/50
    Visualizer.drawNetwork(networkCtx, bestCar.brain)
    requestAnimationFrame(animate)
}

animate()