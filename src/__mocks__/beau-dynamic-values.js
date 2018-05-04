class DynamicValues {
    constructor(registry, settings = {}) {
        registry.defineDynamicValue('add', this.add);
    }

    add(x, y) {
        return x + y;
    }
}

module.exports = DynamicValues;
