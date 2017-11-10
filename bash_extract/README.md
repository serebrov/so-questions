See https://stackoverflow.com/questions/41880854/extract-specific-file-extensions-from-multiple-7-zip-files

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
