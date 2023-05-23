class TreeNode<T> {

    public obj: T;
    public left: TreeNode<T> | null;
    public right: TreeNode<T> | null;
    public parent: TreeNode<T> | null;
    public dimension: number;

    constructor(obj: T, dimension: number, parent: TreeNode<T> | null) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
    }

}

class kdTree<T> {

    private dimenstions: string[];
    private root: TreeNode<T> | null;
    private metric: (a: T, b: T) => number;

    constructor(points: T[], metric: (a: T, b: T) => number, dimensions: string[]) {
        this.dimenstions = dimensions;
        this.root = this.buildTree(points, 0, null);
        this.metric = metric;
    }

    private buildTree(points: T[], depth: number, parent: TreeNode<T> | null): TreeNode<T> | null {
        const dim = depth % this.dimenstions.length;

        if (points.length === 0) {
            return null;
        }
        if (points.length === 1) {
            return new TreeNode(points[0], dim, parent);
        }

        points.sort((a, b) => a[this.dimenstions[dim]] - b[this.dimenstions[dim]]);

        const median = Math.floor(points.length / 2);
        const node = new TreeNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }

    public insert(point: T): void {
        const newNode = new TreeNode(point, 0, null);
        if (!this.root) {
            this.root = newNode;
        } else {
            this.innerInsert(this.root, newNode, 0);
        }
    }

    private innerInsert(currentNode: TreeNode<T>, newNode: TreeNode<T>, depth: number): void {
        const dim = depth % this.dimenstions.length;

        if (newNode.obj[this.dimenstions[dim]] < currentNode.obj[this.dimenstions[dim]]) {
            if (!currentNode.left) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.left = newNode;
            } else {
                this.innerInsert(currentNode.left, newNode, depth + 1);
            }
        } else {
            if (!currentNode.right) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.right = newNode;
            } else {
                this.innerInsert(currentNode.right, newNode, depth + 1);
            }
        }
    }

    public remove(value: T): void {
        const nodeToRemove = this.searchDown(this.root, value);
        if (nodeToRemove) {
            this.removeNode(nodeToRemove);
        }
    }

    private removeNode(node: TreeNode<T>): void {
        if (node === this.root) {
            this.root = null;
            return;
        }

        if (node.parent) {
            if (node.parent.left === node) {
                node.parent.left = null;
            } else if (node.parent.right === node) {
                node.parent.right = null;
            }
        }

        this.innerRemove(node);
    }

    private innerRemove(node: TreeNode<T> | null): void {
        if (!node) {
            return;
        }

        if (node.left && node.right) {
            const successor = this.findMin(node.right, node.dimension);
            node.obj = successor.obj;
            this.innerRemove(successor);
        } else {
            const child = node.left || node.right;
            if (node.parent) {
                if (node.parent.left === node) {
                    node.parent.left = child;
                } else if (node.parent.right === node) {
                    node.parent.right = child;
                }
            }
            if (child) {
                child.parent = node.parent;
            }
        }
    }

    private findMin(currentNode: TreeNode<T>, dimension: number): TreeNode<T> {
        while (currentNode.left) {
            currentNode = currentNode.left;
        }
        return currentNode;
    }

    private searchDown(currentNode: TreeNode<T> | null, value: T): TreeNode<T> | null {
        if (!currentNode) {
            return null;
        }

        if (currentNode.obj === value) {
            return currentNode;
        }

        const dim = currentNode.dimension;
        const nextNode = value < currentNode.obj[dim] ? currentNode.left : currentNode.right;
        return this.searchDown(nextNode, value);
    }

    public search(point: T): boolean {
        return this.innerSearch(this.root, point, 0);
    }

    private innerSearch(currentNode: TreeNode<T> | null, point: T, depth: number): boolean {
        if (!currentNode) {
            return false;
        }

        if (this.metric(currentNode.obj, point) === 0) {
            return true;
        }

        const dim = depth % this.dimenstions.length;
        const nextNode = point[this.dimenstions[dim]] < currentNode.obj[this.dimenstions[dim]]
            ? currentNode.left
            : currentNode.right;

        return this.innerSearch(nextNode, point, depth + 1);
    }

}

export { kdTree, TreeNode }