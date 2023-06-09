#!/usr/bin/env python3

import asyncio

# ANSI colors
c = (
    "\033[0m",  # End of color
    "\033[36m",  # Cyan
    "\033[91m",  # Red
    "\033[35m",  # Magenta
)

async def count(num):
    print(c[num - 1] + f"Initiated count({num}).")
    sum = 0
    for i in range(num):
        print(c[num - 1] + str(num), i)
        await asyncio.sleep(0.1)
        sum += i
        yield i
    print(c[num - 1] + f"---> Finished: count({num})")
    yield sum
    yield "DONE"

async def wrapper(func, *args):
    async for res in func(*args):
        print(res)

async def main():
    tasks = [wrapper(count, 2), wrapper(count, 3), wrapper(count, 4)]
    task_objects = [asyncio.create_task(task) for task in tasks]

    for task_object in task_objects:
        await task_object

if __name__ == "__main__":
    import time

    s = time.perf_counter()
    asyncio.run(main())
    elapsed = time.perf_counter() - s
    print(f"{__file__} executed in {elapsed:0.2f} seconds.")
