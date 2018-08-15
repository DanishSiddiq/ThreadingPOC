const { Worker } = require('worker_threads');

// main attributes
let lst;
let index = -1;
let myWorker;
let interval;

mainBody();

function mainBody () {
    console.log("Main Thread Started");
    lst = Array(1e1).fill().map((v,i) => i);
    initiateWorker();
    interval = setInterval(function(){ processDataInMainThread(); }, 1000);
}

function processDataInMainThread() {
    // update index
    index++;
    // now check first length
    if( lst.length > index) {
        console.log("Message from Main Thread at Index: ", index, " and value is: ", lst[index]);
    }
    else{
        clearInterval(interval);
    }
}

function initiateWorker () {

    // define callback
    let cb = (err, result) => {
        if(err) { return console.error(err); }

        if(result.isInProgress) {
            console.log("Message from child at Index: ", result.index, " and updated value: ", result.val);
        }
        else{
            console.log("Original List Data: ", lst);
            console.log("Updated List From Child: ", result.val);
        }
    };
    // start worker
    myWorker = startWorker(__dirname + '/workerCode.js', cb);
    // post a multiple factor to worker
    myWorker.postMessage({ multipleFactor: getRandomArbitrary(3,9)});
}

function startWorker(path, cb) {
    let w = new Worker(path, { workerData: lst });
    w.on('message', (msg) => {
        cb(null, msg);
    });
    // for error handling
    w.on('error', cb);

    // for exit
    w.on('exit', (code) => {
        if(code !== 0) {
            console.error(new Error(`Worker stopped Code ${code}`))
        }
    });
    return w;
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
