
import { ParseTree } from './TreeParser'

import { Node } from './AST'

export type ParseTreeVisitor = (tree: ParseTree, children: Node[], depth : number) => Node;

export function visitParseTree (tree: ParseTree, visitor: ParseTreeVisitor, depth : number = 0) : Node {
    switch (tree.type) {
    case 'TERM':
        return visitor(tree, [], depth);
    case 'SLICE':
        return visitor(tree, [
            visitParseTree(tree.value, visitor, depth + 1),
            visitParseTree(tree.slice, visitor, depth + 1)
        ], depth);
    case 'APPLY':
        return visitor(tree, [
            visitParseTree(tree.value, visitor, depth + 1),
            visitParseTree(tree.args, visitor, depth + 1)
        ], depth);
    case 'OPERATION':
        return visitor(tree,
            tree.operands.map((t) => visitParseTree(t, visitor, depth + 1)),
            depth
        );
    case 'EXPRESSION':
        return visitor(tree,
            [
                ...(tree.stack.map((t) => visitParseTree(t, visitor, depth + 1))),
                ...(tree.other.map((o) => visitParseTree(o, visitor, depth + 1))),
            ],
            depth
        );
    default:
        throw new Error(`Unknown ParseTree type ${JSON.stringify(tree)}`);
    }
}
