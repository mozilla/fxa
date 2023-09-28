export const mockQuery = jest.fn();
const mock = jest.fn().mockImplementation(() => {
  return {
    query: mockQuery,
  };
});
export const ContentfulClient = mock;
