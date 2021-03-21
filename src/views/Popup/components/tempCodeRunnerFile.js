fetch(`https://app.mailrefine.com/api/v1/single-email-verify`, {
  method: POST,
  headers: new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
  body: {
    api_token:
      "b1APU7PjIUZxyqIqnHMTEtoekA2bYqcq13OGoCaX8V3ywxSxw2ZO6RWG5IIil3480VexIoQKCXNKvCyYqoqCuKZYA7GwJFWwOmk1",
    email: "nadim.ice.nstu@gmail.com",
  },
});