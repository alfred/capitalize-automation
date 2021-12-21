# capitalize-automation


## Install
1. Install node `v16.13.0`
1. Create a `credentials.js` at the top-level that exports a username/password as strings

```js
module.exports = {
  username: '<username goes here>',
  password: '<password goes here>'
}
```

## Running it

1. `node main.js`

You'll see nothing because it's running in headless mode. To see the script run
with a head, edit the `headless` property in config.js. The script will output
to stdout.


## Takeaways
While no instructions were given on how to output all of this data,
the base64 encoded screenshot takes up quite a bit of space in the terminal,
splitting up the outputs. This isn't user-friendly, but it does do what is asked.
If this was meant to diff the screenshot, it could compare the base64 string with
an expected value, or could write the binary to a file.



