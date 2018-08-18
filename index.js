// module included to create worker threads
const { Worker } = require('worker_threads');

// main attributes
let lst;    // list will be populated from 0 to n
let index = -1; // index will be used to traverse list
let myWorker; // worker reference
let interval;

mainBody();

function mainBody () {
    console.log("Main Thread Started");

    // filling array with 100 items
    lst = Array(1e2).fill().map((v,i) => i);

    // initiating worker process
    initiateWorker();

    // traversing list in main method with specific interval
    interval = setInterval(function(){ processDataInMainThread(); }, 1000);
}

// index and value of list will be consoled
function processDataInMainThread() {
    // update index
    index++;
    // check first length
    if ( lst.length > index) {
        console.log("Message from Main Thread at Index: ", index, " and value is: ", lst[index]);
    }
    // no further calling if all items are traversed
    else {
        clearInterval(interval);
    }
}

// Defining callback method for receiving data or error on worker thread
function initiateWorker () {

    // define callback
    let cb = (err, result) => {
        if(err) { return console.error(err); }

        // if worker thread is still working on list then write index and updated value
        if(result.isInProgress) {
            console.log("Message from worker at Index: ", result.index, " and updated value: ", result.val);
        }
        // when worker thread complete process then console original list from main and updated list from worker thread
        else {
            console.log("Original List Data: ", lst);
            console.log("Updated List From worker: ", result.val);
        }
    };

    // start worker
    myWorker = startWorker(__dirname + '/workerCode.js', cb);

    // post a multiple factor to worker thread
    myWorker.postMessage({ multipleFactor: getRandomArbitrary(3,9) });
}

function startWorker(path, cb) {
    // sending path and data to worker thread constructor
    let w = new Worker(path, { workerData: lst });

    // registering events in main thread to perform actions after receiving data/error/exit events
    w.on('message', (msg) => {
        // data will be passed into callback
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

// for generating a random number between min and max
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
