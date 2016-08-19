import Crypto
from Crypto import Random
from Crypto.Cipher import Blowfish
from Crypto.Hash import MD5

def generate_and_store_key_to_file(password):
   """
   Purpose:
   1. Generate a key suitable for cryptographic use.
   2. Store the key in a file in keydir and protect it with a password.

   Arguments:
       password: Your own password to protect your key file

   Return Value:
       success: True if generating a key and storing it in a password-protected file in keydir is successful, False otherwise.

   Notes:
       - Please store the key file in the keydir directory
       - If you used any other information source to solve this task than the linked documentation (e.g. a post on StackOverflow, a blog post or a discussion in a forum), please provide the link right below:
       - additional information sources go here (e.g. https://stackoverflow.com/questions/415511/how-to-get-current-time-in-python)
   """
   keydir="./key"
   # General note: the "It looks like you pasted code into the editor.
   #        This is perfectly fine, but please let us know where you found it."
   # message is really annoying, it pops every time I copy and paste anything,
   # for example, to re-arrange parts of code, or copy and modify similar code
   # The bad part is that the message stays on the screen and covers whether part of the
   # task text above the editor or run/test results below the editor.

   # Documentation is written as an article, it's not structured as a documentation,
   # so it's hard to find parts you need.
   # I am not working regularly with the encryption code, although I now some basic concepts.
   # Here we need the symmetric key (means the same key is used for encryption and decryption).
   # How to generate the key? It is not really clear. In the docs there is an example of
   # key pair generation for the asymmetric encryption.
   # Can we use it to generate the symetric key (just use one key from the pair)?
   # Or do we need to use some function which genrates the random string/number?
   # Probably Crypto.Random.get_random_bytes(num) should do the job.
   # The "num" should probably be the "Key Size/Block Size" from the selected encryption method.
   # Let's take IDEA, as it stated as secure and fast enough, so num=16
   # Hm, got "cannot import name IDEA" for "from Crypto.Cipher import IDEA",
   # also failed to import RC5
   # tried DES, but it doesn't want to use the "secretpassword" as key, as it's longer than
   # 8 bytes
   # using Blowfish as it allows variable len key
   key = Random.get_random_bytes(16)
   # now we need to save this key into the file and encrypt with "password"
   # can we also use the IDEA here? Probably we can (use RC5, failed to import IDEA):
   obj = Blowfish.new(password, Blowfish.MODE_ECB)
   # Note: it would be better to use MODE_CBC or MODE_CFB above, but for that we also need to
   # specify the starting block, IV, I am not really sure how to do this properly, so
   # keep it simple and leave the MODE_ECB as in the example in docs

   # Now cipher the key
   ciph=obj.encrypt(key)

   # write to the file
   with open(keydir + '/keyfile', 'w') as f:
      f.write(ciph)

   return True

def read_key_from_file(password):
   """
   Purpose:
       Read the cryptographic key from a password protected file stored in keydir.

   Arguments:
       password: Your own password to get your key from the key file.

   Return Value:
       key: The key stored in a password protected file stored in keydir if read was successful, None otherwise.

   Notes:
       - If you used any other information source to solve this task than the linked documentation (e.g. a post on StackOverflow, a blog post or a discussion in a forum), please provide the link right below:
       - additional information sources go here (e.g. https://stackoverflow.com/questions/415511/how-to-get-current-time-in-python)
   """
   keydir = "./key"

   ciph = None
   # write to the file
   with open(keydir + '/keyfile', 'r') as f:
      ciph = f.read()
   obj = Blowfish.new(password, Blowfish.MODE_ECB)
   key=obj.decrypt(ciph)
   return key

# This is to test the code for this task.
assert generate_and_store_key_to_file("secretpassword")
assert read_key_from_file("secretpassword")
print "Task completed! Please continue."
