var kue = require( 'kue' );

// create our job queue

var jobs = kue.createQueue();

// one minute

var minute = 60000;

var email = jobs.create( 'email', {
  title: 'Account renewal required', to: 'tj@learnboost.com', template: 'renewal-email', job_id: 1,
} ).delay( minute )
  .priority( 'high' )
  .save(function() {
    console.log(email.id);
  });


email.on( 'promotion', function () {
  console.log( 'renewal job promoted' );
} );

email.on( 'complete', function () {
  console.log( 'renewal job completed' );
} );

jobs.create( 'email', {
  title: 'Account expired', to: 'tj@learnboost.com', template: 'expired-email', job_id: 2,
} ).delay( minute * 10 )
  .priority( 'high' )
  .save();

jobs.promote();

jobs.process( 'email', 10, function ( job, done ) {
  setTimeout( function () {
    done();
  }, Math.random() * 5000 );
} );

// you have the job_id
var job_id_to_update = 1;
// get delayed jobs
jobs.delayed( function( err, ids ) {
  ids.forEach( function( id ) {
    kue.Job.get( id, function( err, job ) {
      // check if this is job we want
      if (job.data.job_id === job_id_to_update) {
          // change job properties
          job.data.title = 'set another title';
          // save changes
          job.update();
      }
    });
  });
});

// start the UI
kue.app.listen( 3000 );
console.log( 'UI started on port 3000' );
