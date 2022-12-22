/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { injectable, inject } from "inversify";
import * as express from "express";
import { IamLoginHandler } from "./iam-login-handler";
import { SessionHandlerProvider } from "../session-handler";
import { Authenticator } from "../auth/authenticator";

@injectable()
export class IamSessionApp {
    @inject(IamLoginHandler)
    protected readonly loginHandler: IamLoginHandler;
    @inject(SessionHandlerProvider)
    protected readonly sessionHandlerProvider: SessionHandlerProvider;
    @inject(Authenticator)
    protected readonly authenticator: Authenticator;

    public create(): express.Application {
        const app = express();
        app.use(express.json());
        app.use(this.sessionHandlerProvider.sessionHandler);
        this.authenticator.initHandlers.forEach((middleware) => {
            app.use(middleware);
        });

        app.post("/session", async (req: express.Request, res: express.Response) => {
            try {
                const sessionData = await this.loginHandler.login(req);
                res.status(200).json(sessionData);
            } catch (error) {
                if (error && "data" in error) {
                    res.status(403).json(error.data);
                } else {
                    res.status(500).json({ error, message: error.message });
                }
            }
        });

        return app;
    }
}
