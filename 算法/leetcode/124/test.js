
var maxPathSum = function(root) {
    if (!root) return 0;
    let result = Number.MIN_SAFE_INTEGER;

    function dfs(root) {
        if (!root) return 0;
        const left = Math.max(0, dfs(root.left)); // 左子树最大路径和
        const right = Math.max(0, dfs(root.right));
        result = Math.max(result, left + right + root.val); // 更新最大路径和
        return Math.max(left, right) + root.val; // 当前节点的最大路径和为当前节点值+左右子树中更大的路径和
    }

    dfs(root);
    return result;
};

