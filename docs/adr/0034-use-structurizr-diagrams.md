# Use Structurizr for Software Diagrams

- Status: accepted
- Deciders: Ben Bangert, Wil Clouser, Dan Schomburg
- Date: 2023-01-26

## Context and Problem Statement

Existing architecture documentation has not been self-explanatory nor follows the more thorough architecture diagramming techniques set down in the [c4 model](c4model.com). MermaidJS has been used for some diagrams but runs into issues with larger more complex diagrams as it can't be manually re-arranged, while LucidChart doesn't lend itself to being serialized for our version control.

## Decision Drivers

- Ability to edit and define relationships and text in a text file.
- DRY, can re-use models between diagrams for consistency in naming and terminology.
- Serializable output that we can save diagrams in our ecosystem repository.
- Can automate diagram generation for our ecosystem docs.
- Cost effective and/or free solution to encourage wider diagram editing audience.

## Considered Options

- A. Structurizr
- B. MermaidJS
- C. LucidChart

## Decision Outcome

Chosen option: A: Structurizr was specifically built for software architecture diagrams, has multiple runtime options available, github actions, and allows the unique ability to define the models and relationships once and re-use them in additional diagrams to add further explanations.

## Pros and Cons of the Options

### A. Structurizr

- Good, because models and relationships can be defined once and re-used.
- Good, because application can be run as docker container for free.
- Good, because there's github actions allowing for integration during doc building.
- Good, because diagrams can be automatically laid out, and manually fine-tuned as needed.
- Good, because all manual changes made in the app can be serialized to JSON and used again.
- Good, because free self-hosted or very cheap cloud hosted solutions are available.
- Bad, because it's a new DSL for diagramming that hasn't been used at Mozilla.
- Bad, because an application will need to be run locally or the cloud to render the diagrams.

### B. MermaidJS

- Good, because diagrams can be rendered inline on our ecosystem docs page via JS.
- Good, because diagrams can be defined purely in simple markup.
- Good, because all markup for the diagrams can be included inline with the documentation.
- Good, because the diagrams can be automatically laid out.
- Good, because it's free to use and distribute.
- Good, because we already use it and are familiar with its markup language.
- Bad, because diagrams can't be manually rearranged if the automatic layout is unhelpful.
- Bad, because models and relationships in the diagrams have to be defined for every diagram rather than re-used between them.

### C. LucidChart

- Good, because diagrams can have their elements manually positioned when complex.
- Good, because Mozilla already uses it and has licenses for its use.
- Bad, because it's expensive and only our licensed users can change the diagram.
- Bad, because diagrams can't be automatically laid out.
- Bad, because models and relationships in the diagram have to be manually created and can't be re-used between them.
- Bad, because diagrams can't be reduced to any representation that can be saved in our repository other than the image.
- Bad, because we will lose our ability to make changes to our diagrams if we stop paying for LucidChart.

## Links

- [Structurizr](https://structurizr.com/)
- [MermaidJS](https://mermaid.js.org/)
- [LucidChart](https://www.lucidchart.com/)
