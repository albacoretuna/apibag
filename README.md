# postcat-
Because you might not need a full desktop app to post http :D 

```bash
JaniE at 11:36
If we're just riffing on this, I'd like to have a cli tool that works like:
npm installable
keep saved requests in a human-readable format in a directory, one per file, and can be parameterized and parameters provided on command line tool
works like imaginary-tool foobar --user 1 would run request in foobar.txt (or whatever format) and fill in template paremeter {user}
can make requests httpie/curl style just on the cli and then --save to imaginary-tool file format for later use

```

file format

```bash
// these be http headers, like you know and love em
Header: Value
Header: {parameterized_value}
---
 // this is body, can be anything
 // but it would be nice to have comments
 // and also use relaxed-json here to it's easier to author
{ "foo": "bar"}
```
