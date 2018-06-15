module.exports = {
    ...require.requireActual('../shared'),
    moduleVersion: jest.fn().mockReturnValue(1)
};
