System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "reqwest": "github:ded/reqwest@^1.1.2"
  }
});

System.config({
  "versions": {
    "github:ded/reqwest": "1.1.2"
  }
});

