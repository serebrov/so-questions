# From https://www.youtube.com/watch?v=SyiTd4rLb2s&list=PLhNSoGM2ik6SIkVGXWBwerucXjgP1rHmB&index=5
import asyncio
from typing import IO
import sys

async def send_file(file: IO[str]) -> None:
    reader, writer = await asyncio.open_connection('127.0.0.1', 8888)

    for message in file:
        writer.write(message.encode())
        await writer.drain()
        data = await reader.read(100)
        text = data.decode()
        print(f'Received: {text!r}')
        if text == 'quit\n':
            break

    print('Closing the connection')
    writer.close()

if __name__ == '__main__':
    asyncio.run(send_file(sys.stdin))
