// Code generated from github.com/fardream/gen-move-container
// Caution when editing manually.
// Double Linked List
module aux::linked_list_v {
    use std::vector::{Self, swap, push_back, pop_back};

    const E_INVALID_ARGUMENT: u64 = 1;
    const E_EMPTY_TREE: u64 = 2;
    const E_KEY_ALREADY_EXIST: u64 = 4;
    const E_INDEX_OUT_OF_RANGE: u64 = 5;
    const E_CANNOT_DESTRORY_NON_EMPTY: u64 = 7;
    const E_EXCEED_CAPACITY: u64 = 8;

    // NULL_INDEX is 1 << 64 - 1 (all 1s for the 64 bits);
    const NULL_INDEX: u64 = 18446744073709551615;

    const MAX_CAPACITY: u64 = 18446744073709551614; // NULL_INDEX - 1

    // check if the index is NULL_INDEX
    public fun is_null_index(index: u64): bool {
        index == NULL_INDEX
    }

    public fun null_index_value(): u64 {
        NULL_INDEX
    }

    // Node is a node in the linked list
    struct Node<V> has store, copy, drop {
        value: V,

        prev: u64,
        next: u64,
    }

    /// LinkedList is a double linked list.
    struct LinkedList<V> has store, copy, drop {
        head: u64,
        tail: u64,
        entries: vector<Node<V>>,
    }

    public fun new<V>(): LinkedList<V> {
        LinkedList<V> {
            head: NULL_INDEX,
            tail: NULL_INDEX,
            entries: vector::empty(),
        }
    }

    ///////////////
    // Accessors //
    ///////////////

    /// borrow returns a reference to the element with its key at the given index
    public fun borrow_at_index<V>(list: &LinkedList<V>, index: u64): &V {
        let entry = vector::borrow(&list.entries, index);
        &entry.value
    }

    /// borrow_mut returns a mutable reference to the element with its key at the given index
    public fun borrow_at_index_mut<V>(list: &mut LinkedList<V>, index: u64): &mut V {
        let entry = vector::borrow_mut(&mut list.entries, index);
        &mut entry.value
    }

    /// size returns the number of elements in the LinkedList.
    public fun size<V>(list: &LinkedList<V>): u64 {
        vector::length(&list.entries)
    }

    /// empty returns true if the LinkedList is empty.
    public fun empty<V>(list: &LinkedList<V>): bool {
        vector::length(&list.entries) == 0
    }

    /// get next entry in linkedlist
    public fun next<V>(list: &LinkedList<V>, index: u64): u64 {
        vector::borrow(&list.entries, index).next
    }

    /// get previous entry in linkedlist
    public fun previous<V>(list: &LinkedList<V>, index: u64): u64 {
        vector::borrow(&list.entries, index).prev
    }

    ///////////////
    // Modifiers //
    ///////////////

    /// insert
    public fun insert<V>(list: &mut LinkedList<V>, value: V) {
        let index = list.tail;
        insert_after(list, index, value)
    }

    /// insert after index. If the list is empty, the index can be NULL_INDEX.
    public fun insert_after<V>(list: &mut LinkedList<V>, index: u64, value: V) {
        let new_index = vector::length(&list.entries);
        assert!(
            new_index < MAX_CAPACITY,
            E_EXCEED_CAPACITY,
        );

        let node = Node<V>{
            value,
            prev: index,
            next: NULL_INDEX,
        };

        if (new_index == 0 && index == NULL_INDEX) {
            list.head = new_index;
            list.tail = new_index;
            push_back(&mut list.entries, node);
            return
        };

        assert!(
            index != NULL_INDEX && index < new_index,
            E_INDEX_OUT_OF_RANGE,
        );

        let prev = vector::borrow_mut(&mut list.entries, index);
        node.next = prev.next;
        prev.next = new_index;
        if (node.next != NULL_INDEX) {
            vector::borrow_mut(&mut list.entries, node.next).prev = new_index;
        } else {
            list.tail = new_index;
        };

        push_back(&mut list.entries, node);
    }

    /// isnert before index. If the list is empty, the index can be NULL_INDEX.
    public fun insert_before<V>(list: &mut LinkedList<V>, index: u64, value: V) {
        let new_index = vector::length(&list.entries);
        assert!(
            new_index < MAX_CAPACITY,
            E_EXCEED_CAPACITY,
        );

        let node = Node<V>{
            value,
            prev: NULL_INDEX,
            next: index,
        };

        if (new_index == 0 && index == NULL_INDEX) {
            list.head = new_index;
            list.tail = new_index;
            push_back(&mut list.entries, node);
            return
        };

        assert!(
            index != NULL_INDEX && index < new_index,
            E_INDEX_OUT_OF_RANGE,
        );
        let next = vector::borrow_mut(&mut list.entries, index);
        node.prev = next.prev;
        next.prev = new_index;
        if (node.prev != NULL_INDEX) {
            vector::borrow_mut(&mut list.entries, node.prev).next = new_index;
        } else {
            list.head = new_index;
        };

        push_back(&mut list.entries, node);
    }

    /// remove deletes and returns the element from the LinkedList.
    /// element is first swapped to the end of the container, then popped out.
    public fun remove<V>(list: &mut LinkedList<V>, index: u64): V {
        let to_remove = vector::borrow(&list.entries, index);
        let prev = to_remove.prev;
        let next = to_remove.next;
        if (prev != NULL_INDEX) {
            vector::borrow_mut(&mut list.entries, prev).next = next;
        } else {
            list.head = next;
        };
        if (next != NULL_INDEX) {
            vector::borrow_mut(&mut list.entries, next).prev = prev;
        } else {
            list.tail = next;
        };

        // swap the element to be removed with the last element
        if (index + 1 != vector::length(&list.entries)) {
            let tail_index = vector::length(&list.entries) - 1;
            swap(&mut list.entries, index, tail_index);
            let swapped = vector::borrow(&list.entries, index);
            let prev = swapped.prev;
            let next = swapped.next;
            if (prev != NULL_INDEX) {
                vector::borrow_mut(&mut list.entries, prev).next = index;
            } else {
                list.head = index;
            };
            if (next != NULL_INDEX) {
                vector::borrow_mut(&mut list.entries, next).prev = index;
            } else {
                list.tail = index;
            };
        };

        // pop
        let Node {
            value,
            next: _,
            prev: _,
        } = pop_back(&mut list.entries);

        value
    }

    /// destroys the linked list if it's empty.
    public fun destroy_empty<V>(tree: LinkedList<V>) {
        assert!(vector::length(&tree.entries) == 0, E_CANNOT_DESTRORY_NON_EMPTY);

        let LinkedList<V> {
            entries,
            head: _,
            tail: _,
        } = tree;

        vector::destroy_empty(entries);
    }

    #[test_only]
    public fun new_node_for_test(value: u128, prev: u64, next: u64): Node<u128> {
        Node { value, prev, next }
    }

    #[test]
    public fun test_linked_list() {
        let l = new<u128>();
        assert!(size(&l) == 0, size(&l));
        insert(&mut l, 5);
        assert!(size(&l) == 1, size(&l));
        let expected = LinkedList<u128> {
            head: 0,
            tail: 0,
            entries: vector<Node<u128>> [
                new_node_for_test(5, NULL_INDEX, NULL_INDEX),
            ],
        };
        assert!(l == expected, 1);
        insert(&mut l, 7);
        let expected = LinkedList<u128> {
            head: 0,
            tail: 1,
            entries: vector<Node<u128>> [
                new_node_for_test(5, NULL_INDEX, 1),
                new_node_for_test(7, 0, NULL_INDEX),
            ],
        };
        assert!(l == expected, 1);

        insert(&mut l, 9);
        let expected = LinkedList<u128> {
            head: 0,
            tail: 2,
            entries: vector<Node<u128>> [
                new_node_for_test(5, NULL_INDEX, 1),
                new_node_for_test(7, 0, 2),
                new_node_for_test(9, 1, NULL_INDEX),
            ],
        };
        assert!(l == expected, 1);

        insert_after(&mut l, 1, 11);
        let expected = LinkedList<u128> {
            head: 0,
            tail: 2,
            entries: vector<Node<u128>> [
                new_node_for_test(5, NULL_INDEX, 1),
                new_node_for_test(7, 0, 3),
                new_node_for_test(9, 3, NULL_INDEX),
                new_node_for_test(11, 1, 2),
            ],
        };
        assert!(l == expected, 1);

        insert_before(&mut l, 0, 13);
        let expected = LinkedList<u128> {
            head: 4,
            tail: 2,
            entries: vector<Node<u128>> [
                new_node_for_test(5, 4, 1),
                new_node_for_test(7, 0, 3),
                new_node_for_test(9, 3, NULL_INDEX),
                new_node_for_test(11, 1, 2),
                new_node_for_test(13, NULL_INDEX, 0),
            ],
        };
        assert!(l == expected, 1);

        remove(&mut l, 1);
        std::debug::print(&l);
        let expected = LinkedList<u128> {
            head: 1,
            tail: 2,
            entries: vector<Node<u128>> [
                new_node_for_test(5, 1, 3),
                // new_node_for_test(7, 0, 3),
                new_node_for_test(13, NULL_INDEX, 0),
                new_node_for_test(9, 3, NULL_INDEX),
                new_node_for_test(11, 0, 2),
            ],
        };
        assert!(l == expected, 1);

        remove(&mut l, 3);
        let expected = LinkedList<u128> {
            head: 1,
            tail: 2,
            entries: vector<Node<u128>> [
                new_node_for_test(5, 1, 2),
                new_node_for_test(13, NULL_INDEX, 0),
                new_node_for_test(9, 0, NULL_INDEX),
                // new_node_for_test(11, 0, 2),
            ],
        };
        assert!(l == expected, 1);

        remove(&mut l, 0);
        let expected = LinkedList<u128> {
            head: 1,
            tail: 0,
            entries: vector<Node<u128>> [
                // new_node_for_test(5, 1, 2),
                new_node_for_test(9, 1, NULL_INDEX),
                new_node_for_test(13, NULL_INDEX, 0),
            ],
        };
        assert!(l == expected, 1);

        remove(&mut l, 0);
        let expected = LinkedList<u128> {
            head: 0,
            tail: 0,
            entries: vector<Node<u128>> [
                // new_node_for_test(9, 1, NULL_INDEX),
                new_node_for_test(13, NULL_INDEX, NULL_INDEX),
            ],
        };
        assert!(l == expected, 1);

        remove(&mut l, 0);
        let expected = LinkedList<u128> {
            head: NULL_INDEX,
            tail: NULL_INDEX,
            entries: vector<Node<u128>> [
                // new_node_for_test(13, NULL_INDEX, NULL_INDEX),
            ],
        };
        assert!(l == expected, 1);
    }
}
