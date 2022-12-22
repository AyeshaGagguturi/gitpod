/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import { injectable, inject } from "inversify";
import * as express from "express";

import { UserService } from "../user/user-service";

@injectable()
export class IamLoginHandler {
    @inject(UserService) protected readonly userService: UserService;

    public async login(req: express.Request): Promise<SessionData> {
        // TODO(at) create/update account based on id_token
        // const idToken = req.body;

        const user = await this.userService.createUser({
            identity: {
                authId: "fake-id-" + Date.now(),
                authName: "FakeUser",
                authProviderId: "oidc1",
                primaryEmail: "fake@email.io",
            },
            userUpdate: (user) => {
                user.name = "FakeUser";
                user.fullName = "Fake User";
                user.avatarUrl = "https://github.com/github.png";
            },
        });

        await new Promise<void>((resolve, reject) => {
            req.login(user, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const cookie = req.session.cookie;

        return {
            cookie,
        };
    }
}

export interface SessionData {}
