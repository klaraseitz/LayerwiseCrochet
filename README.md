# Projectional Editor to build Digital Crochet Patterns

Crochet is a popular handcraft all over the world. While other techniques such as knitting or weaving have received technical support over the years through machines, crochet is still a purely manual craft. Not just the act of crochet itself is manual but also the process of creating instructions for new crochet patterns, which is barely supported by domain specific digital solutions. This leads to unstructured and often also ambiguous and erroneous pattern instructions. 
This prototype is a proof of a concept I developed as my master thesis to digitally represent crochet patterns. This format incorporates crochet techniques which allows domain specific support for crochet pattern designers during the pattern creation and instruction writing process. It is based on a graph structure used as domain specific language to specify crochet patterns. The projectional editor uses the graph as representation format of patterns and a diagramming system (internationally known crochet charts) to visualize them in 2D and 3D.

[Watch](https://www.youtube.com/watch?v=GTiUSk4bKU4) a demo video which demonstrates the usage and [test](https://klaraseitz.github.io/crochet/) the prototype. 

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Previewing production build locally
```
npm install -g serve
# -s flag means serve it in Single-Page Application mode
# which deals with the routing problem below
serve -s dist
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
