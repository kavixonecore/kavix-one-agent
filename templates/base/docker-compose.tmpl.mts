import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders docker-compose.yml with a MongoDB service for local dev and smoke testing.
 */
export function renderDockerCompose(context: IGenerationContext): string {
  const { projectName } = context;
  const safeName = projectName.toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  return `services:
  mongodb:
    image: mongo:7
    container_name: ${safeName}-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: rootpassword
    volumes:
      - ${safeName}-mongodb-data:/data/db
    networks:
      - ${safeName}-network

networks:
  ${safeName}-network:
    driver: bridge

volumes:
  ${safeName}-mongodb-data:
    driver: local
`;
}
