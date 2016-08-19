def final_test():
   password = "PZRRcQ8xOxqy4QtqPZlZ"

   # Generate a new symmetric encryption key and store it password protected in keyfile
   assert generate_and_store_key_to_file(password), "Generating and storing new key failed."
   print "Generated a new encryption key and stored it in a password protected file. {:s} is used to password-protect the key file.".format(password)

   # Read the key from keyfile
   key = read_key_from_file(password)
   assert key, "Reading key from password protected file failed."
   print "Read the encryption key."

   plaintext = "I am at the harbor and I am witnessing human trafficking."
   # Encrypt plainText
   ciphertext = encrypt(plaintext, key)
   assert ciphertext, "Encrypting plainText failed."
   print "Encrypted {:s}. Cipher text is: {:s}.".format(plaintext, ciphertext)

   # Decrypt the cipherText and verify that the result matches the original plain text.
   plaintext1 = decrypt(ciphertext, key)
   assert plaintext1, "Decrypting cipherText failed."
   assert plaintext1 == plaintext, "The decrypted cipher text does not match the original plain text."
   print "Successfully encrypted and decrypted a secret message. Yay!"
   print "Final test completed! Please continue with the survey."

final_test()
