var express = require('express');
var bodyParser = require('body-parser');
var childProcess = require('child_process');
var app = express();


//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.post('/spawn/:symbol', function(req, res) {
  console.log("received spawn request")

  const cmd = `docker run -d --name ${req.params.symbol} --network=host --ulimit memlock=-1 -e SYMBOL=${req.params.symbol} --ipc=host -v /tmp:/tmp --restart=always binance-futures-trade-c`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send("Err spawning");
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.post('/spawn/non-live/:symbol', function(req, res) {
  const { query } = req;
  const { sell_request_ids } = query;

  console.log(`received spawn request ${symbol} ${sell_request_ids}`)

  const cmd = `docker run -d --name ${req.params.symbol}-non-live --network=host --ulimit memlock=-1 -e SYMBOL=${req.params.symbol} -e SELL_REQUEST_IDS=${sell_request_ids} --ipc=host -v /tmp:/tmp --restart=always binance-futures-trade-n`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send("Err spawning");
  }

  if (r.output[1].length > 0) {
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.delete('/:symbol', function(req, res) {
  console.log("received delete request")

  const cmd = `docker stop ${req.params.symbol}`;

  const r =  childProcess.spawnSync("sudo", cmd.split(" "), { encoding: 'utf-8' });

  if (r.output[2].length > 0) {
    return res.status(500).send("Error delete");
  }

  const cmd_stop = `docker rm ${req.params.symbol}`;
  const res_del =  childProcess.spawnSync("sudo", cmd_stop.split(" "), { encoding: 'utf-8' });

  if (res_del.output[2].length > 0) {
    return res.status(500).send("Error stopping");
  }

  res.sendStatus(200);
});

app.listen(3333);
