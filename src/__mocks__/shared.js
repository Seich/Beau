module.exports = {
    ...jest.requireActual('../shared'),
    moduleVersion: jest.fn().mockReturnValue(1)
};
