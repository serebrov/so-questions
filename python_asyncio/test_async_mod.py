#!/usr/bin/env python3

import asyncio
from asyncio import Queue

# ANSI colors
c = (
    "\033[0m",  # End of color
    "\033[36m",  # Cyan
    "\033[91m",  # Red
    "\033[35m",  # Magenta
)

async def count(num, queue):
    print("[...]", c[num - 1] + f"Initiated count({num}).")
    sum = 0
    for i in range(num):
        print("[...]", c[num - 1] + str(num), i)
        await asyncio.sleep(0.1)
        sum += i
        await queue.put([num, i])
    print("[...]", c[num - 1] + f"---> Finished: count({num})")
    await queue.put([num, sum])
    await queue.put([num, "DONE"])

async def result_consumer(queues):
    for queue in queues:
        while True:
            res = await queue.get()
            if res[1] == "DONE":
                break
            print(">", res)

async def main():
    queues = [Queue() for _ in range(3)]
    tasks = [count(4, queues[0]), count(3, queues[1]), count(2, queues[2])]
    consumer = asyncio.create_task(result_consumer(queues))

    await asyncio.gather(*tasks, consumer)

if __name__ == "__main__":
    import time

    s = time.perf_counter()
    asyncio.run(main())
    elapsed = time.perf_counter() - s
    print(f"{__file__} executed in {elapsed:0.2f} seconds.")
