See https://stackoverflow.com/questions/41880854/extract-specific-file-extensions-from-multiple-7-zip-files

** Question **

I have a RAR file and a ZIP file. Within these two there is a folder. Inside the folder there are several 7-zip (.7z) files. Inside every 7z there are multiple files with the same extension, but whose names vary.

RAR or ZIP file
  |___folder
        |_____Multiple 7z
                  |_____Multiple files with same extension and different name

I want to extract just the ones I need from thousands of files... I need those files whose names include a certain substring. For example, if the name of a compressed file includes '[!]' in the name or '(U)' or '(J)' that's the criteria to determine the file to be extracted.

I can extract the folder without problem so I have this structure:

folder
   |_____Multiple 7z
                |_____Multiple files with same extension and different name

I'm in a Windows environment but I have Cygwin installed. I wonder how can I extract the files I need painlessly? Maybe using a single command line line.

Additional information:

I'd like an answer with a general example (maybe in command line not necessailly to be done in Windows,it can be done with Linux/bash, etc) to extract the files given a substring criteria.
Otherwise I'll have to open every single 7-zip file and select manually the files I need, and I have thousands of files to do this task.

The criteria I need is:
- Among the files included in a 7-zip file, the filename has to include '[!]' as priority.
 - It can also have '(U)', '(E)' or '(J)'. a) If '[!]' is present, is accompained of any of these 3 letters in between parenthesis and a space before it.
 - EXAMPLE: '(U) [!]'
- b) There can be files where '[!]' is not present and any of those 3 letters with parenthesis can be accompained of another optional code.
 - EXAMPLES: '(J) [b1]', '(J) [b2]', '(J) [o1]' and '(J)'.
 - In this example, the file without the secondary code is the one that needs to be extracted. That is: '(J)'. THANKS to anyone who helps me achieve this!

** Solution **

This solution is based on bash, not sure if it'll work on Cygwin, I tested it on Ubuntu.

Since you have the conditional requirement to search for `(X) [!].ext` files first and if there are no such files then look for `(X).ext` files, I don't think it is possible to write some single expression to handle this logic.

The solution should have some if/else logic to test the list of files inside the archive and decide which files to extract.

Here is the initial structure inside the zip/rar archive (I made a [script](https://github.com/serebrov/so-questions/blob/master/bash_extract/prepare.sh) to prepare this structure):

  folder
  ├── 7z_1.7z
  │   ├── (E).txt
  │   ├── (J) [!].txt
  │   ├── (J).txt
  │   ├── (U) [!].txt
  │   └── (U).txt
  ├── 7z_2.7z
  │   ├── (J) [b1].txt
  │   ├── (J) [b2].txt
  │   ├── (J) [o1].txt
  │   └── (J).txt
  └── 7z_3.7z
      ├── (E) [!].txt
      ├── (J).txt
      └── (U).txt

The output is this:

    output
    ├── 7z_1.7z           # This is a folder, not an archive
    │   ├── (J) [!].txt   # Here we extracted only files with [!]
    │   └── (U) [!].txt
    ├── 7z_2.7z
    │   └── (J).txt       # Here there are no [!] files, so we extracted (J)
    └── 7z_3.7z
        └── (E) [!].txt   # We had here both [!] and (J), extracted only file with [!]

And this is the [script](https://github.com/serebrov/so-questions/blob/master/bash_extract/extract.sh) to do the extraction.
