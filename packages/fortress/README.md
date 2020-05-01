## A demo of a subscription flow

## Running locally

1. install [git] and [node]
1. get a local copy of the repository: `git clone https://github.com/mozilla/fxa`
1. `cd fxa/packages/fortress`
1. install dependencies: `npm install`
1. run the server: `npm run dev`
1. visit it in your browser: `http://localhost:9292/`
1. if you want to develop even faster, open a new terminal window and run `npm run ui`
1. now you can go to `http://localhost:5000` and develop without having to ever restart the server or refresh the browser

[git]: http://git-scm.org
[node]: http://nodejs.org

## Testing

This package does not currently have a test suite.

Run `npm test` to lint the code.
