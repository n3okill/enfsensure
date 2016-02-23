[![Build Status](https://travis-ci.org/n3okill/enfsensure.svg)](https://travis-ci.org/n3okill/enfsensure)
[![Build status](https://ci.appveyor.com/api/projects/status/xa45r6pkf4etbo6s?svg=true)](https://ci.appveyor.com/project/n3okill/enfsensure)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/06869443a19a488ea35387168e6d808b)](https://www.codacy.com/app/n3okill/enfsensure)
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=64PYTCDH5UNZ6)

[![NPM](https://nodei.co/npm/enfsensure.png)](https://nodei.co/npm/enfsensure/)

enfsensure
==========
Module that add ensure functionality to node fs module

**enfs** stands for [E]asy [N]ode [fs]

This module is intended to work as a sub-module of [enfs](https://www.npmjs.com/package/enfs)


Description
-----------
This module will add various method that allows the user to ensure
the creation of a file, directory, link or symlink in the file system,
if the parent directory of the item to be ensured don't exist it will be automatically created.

- This module will add following methods to node fs module:
  * ensureFile
  * ensureFileSync
  * ensureDir
  * ensureDirSync
  * ensureLink
  * ensureLinkSync
  * ensureSymlink
  * ensureSymlinkSync
  
  
Usage
-----
`enfsensure`

```js
    var enfsensure = require("enfsensure");
```

Errors
------
All the methods follows the node culture.
- Async: Every async method returns an Error in the first callback parameter
- Sync: Every sync method throws an Error.


Additional Methods
------------------
- [ensureFile](#ensurefile)
- [ensureFileSync](#ensurefilesync)
- [ensureDir](#ensuredir)
- [ensureDirSync](#ensuredirsync)
- [ensureLink](#ensurelink)
- [ensureLinkSync](#ensurelinksync)
- [ensureSymlink](#ensuresymlink)
- [ensureSymlinkSync](#ensuresymlinksync)


### ensureFile
  - **ensureFile(path, [options], callback)**

> Ensures the file existence in the file system, if the file don't exist it will be created.

[options]:
  * fs (Object): an alternative fs module to use (default will be [enfspatch](https://www.npmjs.com/package/enfspatch))
  * mode (String or Number): the mode to set to the file, if the file already exists and have a different mode it will be change to the new mode
  * data (String): Data that will be written to the file, if it already exists the data will be appended if append flag is true.
  * append (Boolean): if true data will be appended to the file (Default: false)
  * encoding (String): specify the file encoding
  * dirMode (String or Number): the mode that will be set to the parent directory
  * stream (Boolean): if true this method will return a WriteStream to the ensured file
  * streamOptions (Object): Options that will be passed to the WriteStream [createWriteStream()](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)


Sync:
    * **ensureFileSync(path,[options])**



```js
    enfsensure.ensureFile("/path/to/any/file",{ data: "contents", encoding: "utf8" },function(err){
        if(!err){
            console.log("data was written to the file");
        }
    });
```

Stream

```js
    enfsensure.ensureFile("/path/to/any/file",{ stream: true, streamOptions: { autoClose: true} },function(err, stream){
        if(!err){
            console.log("stream is a WriteStream object.");
        }
    });
```


### ensureDir
  - **ensureDir(path, [options], callback)**

> Ensure directory existence in the file system, if directory don't exist it will be created

[options]:
  * fs (Object): an alternative fs module to use (default will be [enfspatch](https://www.npmjs.com/package/enfspatch))
  * mode (String or Number): the mode to set to the directory, if the directory already exists and is different then it will be changed to the new mode


Sync:
    * **ensureDirSync(path,[options])**

```js
    enfsensure.ensureDir("/path/to/the/new/folder", function(err, path){
        if(!err){
            console.log("directory was created in the path: "+path);
        }
    });
```

### ensureLink
  - **ensureLink(srcPath, dstPath, [options], callback)**

> Ensure link creation in the file system. [link](https://nodejs.org/api/fs.html#fs_fs_link_srcpath_dstpath_callback)

[options]:
  * fs (Object): an alternative fs module to use (default will be [enfspatch](https://www.npmjs.com/package/enfspatch))


Sync:
    * **ensureLinkSync(srcPath, dstPath, [options])**

```js
    enfsensure.ensureLink("/srcPath", "/dstPath", function(err, dstPath){
        //do something
    });
```


### ensureSymlink
  - **ensureSymlink(target, path, [options], callback)**

> Ensure symlink creation in the file system. [symlink](https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback)

[options]:
  * fs (Object): an alternative fs module to use (default will be [enfspatch](https://www.npmjs.com/package/enfspatch))
  * type (String): symlink type (Default: file)

Sync:
    * **ensureSymlinkSync(path,[options])**

```js
    enfsensure.ensureSymlink("./foo", "./new-port", "file", function(err, dstPath){
        //do something
    });
```

License
-------

Creative Commons Attribution 4.0 International License

Copyright (c) 2016 Joao Parreira <joaofrparreira@gmail.com> [GitHub](https://github.com/n3okill)

This work is licensed under the Creative Commons Attribution 4.0 International License. 
To view a copy of this license, visit [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).


