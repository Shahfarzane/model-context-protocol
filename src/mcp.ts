/**
 * Model Context Protocol (MCP) Core Implementation
 */

export interface Context {
  id: string;
  type: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface Protocol {
  name: string;
  version: string;
  handlers: ProtocolHandlers;
}

export interface ProtocolHandlers {
  validateContext: (context: Context) => boolean;
  processContext: (context: Context) => Promise<any>;
  transformOutput?: (output: any) => any;
}

export class ModelContextProtocol {
  private contexts: Map<string, Context>;
  private protocols: Map<string, Protocol>;

  constructor() {
    this.contexts = new Map();
    this.protocols = new Map();
  }

  /**
   * Register a new context
   */
  public registerContext(context: Context): void {
    if (!context.id || !context.type) {
      throw new Error('Context must have an id and type');
    }
    this.contexts.set(context.id, context);
  }

  /**
   * Register a new protocol
   */
  public registerProtocol(protocol: Protocol): void {
    if (!protocol.name || !protocol.version) {
      throw new Error('Protocol must have a name and version');
    }
    this.protocols.set(`${protocol.name}@${protocol.version}`, protocol);
  }

  /**
   * Process a context using a specific protocol
   */
  public async processContext(
    contextId: string,
    protocolName: string,
    protocolVersion: string
  ): Promise<any> {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const protocol = this.protocols.get(`${protocolName}@${protocolVersion}`);
    if (!protocol) {
      throw new Error(`Protocol not found: ${protocolName}@${protocolVersion}`);
    }

    if (!protocol.handlers.validateContext(context)) {
      throw new Error('Context validation failed');
    }

    const result = await protocol.handlers.processContext(context);
    return protocol.handlers.transformOutput ? 
      protocol.handlers.transformOutput(result) : 
      result;
  }

  /**
   * Get all registered contexts
   */
  public getContexts(): Context[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Get all registered protocols
   */
  public getProtocols(): Protocol[] {
    return Array.from(this.protocols.values());
  }
}