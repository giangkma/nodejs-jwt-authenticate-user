import { Request, Response } from 'express';
import { ChangePassword, IUser } from '../domain/auth.domain';
import { RequestUser } from '../domain/common.domain';
import { fillterDataUser } from '../helpers/functions';
import { generateToken } from '../helpers/jwt';
import { responseAuthError, responseSuccess } from '../helpers/response';
import authService from '../service/auth.service';
import userService from '../service/user.service';

// Thời gian sống của token
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || '3d';

const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET ||
    'access-token-secret-example-giangdtkma.com-!@#$';

/**
 * controller login
 * @param {*} req
 * @param {*} res
 */
const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password } = req.body;
        const user: any = await userService.getUserByUsername(username);
        if (!user) throw new Error('Sai tên đăng nhập !');
        if (!(await user.isPasswordMatch(password))) {
            throw new Error('Mật khẩu không đúng !');
        }
        const dataUserFilter = fillterDataUser(user);
        const accessToken = await generateToken(
            dataUserFilter,
            accessTokenSecret,
            accessTokenLife,
        );
        return responseSuccess(res, {
            accessToken,
            information: dataUserFilter,
        });
    } catch (error) {
        return responseAuthError(res, error.message ?? error);
    }
};

const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const result: IUser = await authService.register(req.body);
        const dataUserFilter = fillterDataUser(result);
        const accessToken = await generateToken(
            dataUserFilter,
            accessTokenSecret,
            accessTokenLife,
        );
        return responseSuccess(res, {
            accessToken,
            information: dataUserFilter,
        });
    } catch (error) {
        return responseAuthError(res, error.message ?? error);
    }
};

const getProfile = async (
    req: RequestUser,
    res: Response,
): Promise<Response> => {
    try {
        const { id } = req.userInfo;
        const user: IUser = await userService.getUserById(id);
        const result: IUser = fillterDataUser(user);
        return responseSuccess(res, result);
    } catch (error) {
        return responseAuthError(res, error.message ?? error);
    }
};

const updateProfile = async (
    req: RequestUser,
    res: Response,
): Promise<Response> => {
    try {
        const { id } = req.userInfo;
        const data = req.body;
        const user: IUser = await userService.updateProfile(id, data);
        const result: IUser = fillterDataUser(user);
        return responseSuccess(res, result);
    } catch (error) {
        return responseAuthError(res, error.message ?? error);
    }
};

const changePassword = async (
    req: RequestUser,
    res: Response,
): Promise<Response> => {
    try {
        const { id } = req.userInfo;
        const data: ChangePassword = req.body;
        const user: any = await userService.getUserById(id);
        if (!user) throw new Error('Người dùng không tồn tại !');
        if (!(await user.isPasswordMatch(data.password))) {
            throw new Error('Mật khẩu không đúng !');
        }
        await userService.changePassword(id, data.newPassword);
        return responseSuccess(res, {
            success: true,
        });
    } catch (error) {
        return responseAuthError(res, error.message ?? error);
    }
};

export default {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};
