
// Schema type
const graphData = {
    clusters: [
        {
            id: 'animals',
            label: 'Animals',
            color: '#2c3e50',
            subclusters: [
                {
                    id: 'mammals',
                    label: 'Mammals',
                    color: '#3498db',
                    subclusters: [
                        {
                            id: 'dogs',
                            label: 'Dogs',
                            color: '#5dade2',
                            words: [
                                { id: 'dog', label: 'Dog' },
                                { id: 'puppy', label: 'Puppy' },
                                { id: 'bark', label: 'Bark' },
                                { id: 'leash', label: 'Leash' }
                            ]
                        },
                        {
                            id: 'cats',
                            label: 'Cats',
                            color: '#5dade2',
                            words: [
                                { id: 'cat', label: 'Cat' },
                                { id: 'kitten', label: 'Kitten' },
                                { id: 'meow', label: 'Meow' },
                                { id: 'purr', label: 'Purr' }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

const nodeHierarchy = new Map();
const nodeParents = new Map();
const breadcrumbHistory = [];

function findNodeInData(id, clusters) {
    for (const cluster of clusters) {
        if (cluster.id === id) return cluster;
        if (cluster.subclusters) {
            const found = findNodeInData(id, cluster.subclusters);
            if (found) return found;
        }
        if (cluster.words) {
            const found = cluster.words.find(word => word.id === id);
            if (found) return found;
        }
    }
    return null;
}

function buildNodeHierarchy(clusters, parentId = null) {
    clusters.forEach(cluster => {
        nodeHierarchy.set(cluster.id, cluster);
        if (parentId) nodeParents.set(cluster.id, parentId);
        
        if (cluster.subclusters) {
            buildNodeHierarchy(cluster.subclusters, cluster.id);
        }
        if (cluster.words) {
            cluster.words.forEach(word => {
                nodeHierarchy.set(word.id, word);
                nodeParents.set(word.id, cluster.id);
            });
        }
    });
}

function generateNodesAndEdges(cluster) {
    const nodes = [];
    const edges = [];

    nodes.push({
        id: cluster.id,
        label: cluster.label,
        color: {
            background: cluster.color,
            border: '#fff'
        },
        font: { color: '#fff', size: 16 },
        size: 30
    });

    if (cluster.subclusters) {
        cluster.subclusters.forEach(subcluster => {
            nodes.push({
                id: subcluster.id,
                label: subcluster.label,
                color: {
                    background: subcluster.color,
                    border: '#fff'
                },
                font: { color: '#fff', size: 16 },
                size: 25
            });
            edges.push({
                from: cluster.id,
                to: subcluster.id,
                color: { color: '#bdc3c7' }
            });
        });
    }

    if (cluster.words) {
        cluster.words.forEach(word => {
            nodes.push({
                id: word.id,
                label: word.label,
                color: {
                    background: '#95a5a6',
                    border: '#fff'
                },
                font: { color: '#fff', size: 14 },
                size: 20
            });
            edges.push({
                from: cluster.id,
                to: word.id,
                color: { color: '#bdc3c7' }
            });
        });
    }

    return { nodes, edges };
}

buildNodeHierarchy(graphData.clusters);

const container = document.getElementById('network');
const data = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
};

const options = {
    physics: {
        enabled: true,
        stabilization: true,
        barnesHut: { 
            gravitationalConstant: -2000,
            springLength: 150,
            springConstant: 0.04
        }
    },
    nodes: {
        shape: 'circle',
        borderWidth: 2,
        font: {
            size: 16,
            face: 'arial'
        }
    },
    edges: {
        width: 2,
        arrows: {
            to: { enabled: true, scaleFactor: 0.5 }
        },
        smooth: {
            type: 'continuous'
        }
    },
    interaction: {
        hover: true,
        tooltipDelay: 200
    }
};

const network = new vis.Network(container, data, options);

function updateBreadcrumb() {
    const breadcrumbDiv = document.getElementById('breadcrumb');
    breadcrumbDiv.innerHTML = breadcrumbHistory.map((node, index) => {
        const text = `<span class="breadcrumb-item" data-id="${node.id}">${node.label}</span>`;
        return index < breadcrumbHistory.length - 1 
            ? text + '<span class="breadcrumb-separator">></span>' 
            : text;
    }).join('');

    document.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('click', function() {
            const nodeId = this.dataset.id;
            const node = nodeHierarchy.get(nodeId);
            const index = breadcrumbHistory.findIndex(n => n.id === nodeId);
            breadcrumbHistory.splice(index + 1);
            showNode(node);
        });
    });
}

function showNode(node) {
    if (!breadcrumbHistory.find(n => n.id === node.id)) {
        breadcrumbHistory.push(node);
    }
    updateBreadcrumb();

    const { nodes, edges } = generateNodesAndEdges(node);
    data.nodes.clear();
    data.edges.clear();
    data.nodes.add(nodes);
    data.edges.add(edges);

    network.fit({
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
}

network.on('click', function(params) {
    if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        const clickedNode = nodeHierarchy.get(clickedNodeId);
        if (clickedNode && (clickedNode.subclusters || clickedNode.words)) {
            showNode(clickedNode);
        }
    }
});
showNode(graphData.clusters[0]);