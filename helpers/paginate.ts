// Define paginate function which takes in schema, query, page (default: 1), documentPerPage (default: 20) and sortFilter (default: { createdAt: -1 })
export const paginate = async (
  schema: any,
  query: any,
  page: any = 1,
  documentPerPage: any = 20,
  sortFilter: object = { createdAt: -1 },
) => {
  // Check if page or documentPerPage are not numbers, throw validation error.
  if (Number.isNaN(Number(page)) || Number.isNaN(Number(documentPerPage)))
    throw {
      error: "ValidationError",
      message: "page or dpp must be a number",
      name: "ValidationError",
    };
  else {
    // Parse page and documentPerPage to integer.
    page = parseInt(page);
    documentPerPage = parseInt(documentPerPage);
  }

  // Check if page or documentPerPage are less than one, throw validation error.
  if (page < 1 || documentPerPage < 1)
    throw {
      error: "ValidationError",
      message: "page and dpp must be greater than 0",
      name: "ValidationError",
    };

  // Count total documents based on given query
  const total_documents = await schema.countDocuments(query);

  // Calculate the total pages needed for pagination based on documentPerPage value
  const total_pages = Math.ceil(total_documents / documentPerPage);

  // Limit the number of documents to be returned in each response based on documentPerPage value
  const limit = documentPerPage;

  // Determine the amount of documents to skip over in order to return the correct page of documents
  const skip = (page - 1) * documentPerPage;

  // Find the documents that match the schema and the given query, sorted based on the provided sortFilter
  const docs = await schema
    .find(query)
    .sort(sortFilter)
    .skip(skip)
    .limit(limit);

  // Create a result object containing the total documents, total pages, current page and document per page.
  const result: any = {
    total_documents: total_documents,
    total_pages: total_pages,
    current_page: page,
    document_per_page: documentPerPage,
  };

  // If no documents are found, add a message field to the result object. Otherwise, add the documents to the result object.
  if (docs.length === 0) result.message = "No documents found";
  else result.documents = docs;

  // Return the result object.
  return result;
};
