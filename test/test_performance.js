var assert = require('assert'),
util = require('util'),
spawn = require('child_process').spawn;
gazebojs = require('../index');

suite('performance', function() {

// This test is to see how fast can we process msgs from a topic.
// This would be a key to replace gzbridge by gazebojs, if the performance
// turns out to be not good we wont be aable to do it then.

// Do i need advertise ?, it would allow me to set the frequency of publishing msgs.

var gzserver;
var gazebo;

// This value shouldn't be greater than 4900, or the test will time out.
var test_period = 4000;
var test_period_sec = test_period /1000;

this.timeout(5000);

suiteSetup (function(done){

        // console.log('suiteSetup');
        gzserver = spawn('gzserver', [ __dirname + '/../examples/pendulum_cam.world']);
        gzserver.on('data', (data) => { console.log('gz: ' + data) })
        // give a second for gzserver to come up
        setTimeout(()=> {
            gazebo = new gazebojs.Gazebo();
            gazebo.proc = gzserver
            console.log('sim pid: ' + gazebo.proc.pid)
            done();
        }, 100);
    });

// How fast can gazebojs process msgs from a certain topic.
  test('Reciving msgs', function(done) {
    first = true;
    counter = 0;
    gazebo.subscribe('gazebo.msgs.PosesStamped', '~/pose/info', function(e,d){
        counter ++;
        setTimeout(()=> {
          var rate = counter/test_period_sec;
            console.log(counter + ' messages received in ' + test_period_sec + ' seconds, ' + rate +' messages/sec')
            gazebo.unsubscribe('~/pose/info');
// We would consider this a minimum raate for now, could be changed later.
            if(rate < 50){
              console.log('Too slow')
            }
            else{
            done();
            }            
        }, test_period);
    });
});

  suiteTeardown(function() {
    console.log('suiteTeardown');
    gzserver.kill('SIGHUP');
});

});