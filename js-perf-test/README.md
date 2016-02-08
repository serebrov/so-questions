See: http://stackoverflow.com/questions/35166080/javascript-profiling-mystery-closure-variables

I tried to run the measurements and first what I noticed is that it is hard to understand what is going on just using the code from your question.

If I run these tests once, looking at the timeline, each time I repeat the experiment, the results differ much.
From few runs it looked like the third (`run_local_fn`) is usually longer than others.

I also then tried to run them in the backward order (click buttons from 4 to 1) and got the completely different result - the `run_local_obj` was the longest.

So I modified the test code a bit, to be able to get stable results.
Full code [is here], and here is how I run each test in Chrome:
- Open the tab http://localhost/perf.html, open dev tools
- Start the timeline recording
- Click the button
- Wait for results in console (min/max/mean)
- Stop the timeline recording

Results are stable and repeatable (both timings and timeline view), here is one of tests:

- `run_local_obj' - 508.45ms, [timeline](./1_run_local_obj.png)
- `run_proto_obj' - 433.11ms, [timeline](./1_run_proto_obj.png)
- `run_local_fn' - 756.26ms, [timeline](./1_run_local_fn.png)
- `run_proto_fn' - 560.62ms, [timeline](./1_run_proto_fn.png)

So what do we see here is:

1) The `run_proto_obj` is the fastest and `run_local_obj` is close to it.

It is expected for `run_proto_obj` to be most efficient since it uses statically defined object with strings.
And JS engine is probably able to optimize the `run_local_obj`, so the `x` object is re-used and not created each time.

2) The `run_local_fn` is the slowest.

I think that here the `x` variable can not be optimized, so it is created each time you call the function.

3) The `run_proto_fn` is faster than `run_local_fn`, but slower than first two functions.

It seems to be also expected, the object with `a, b, c` is defined only once (so it is faster than `run_local_fn`.
And comparing to the first two functions, it calculates the resulting strings dynamically, so it is slower.

So back to your question:

> As expected run_proto_fn run few times faster and with minimal garbage collections, and low memory heap.
> But run_proto_obj happened to make exact opposite, as if it was costly having non-function values at object prototype property properties.

It looks for me like you just didn't setup the experiment properly.
According to the results above, `run_proto_obj` is actually the fastest.
