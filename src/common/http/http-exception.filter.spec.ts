import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function mockHost(): {
  host: ArgumentsHost;
  json: jest.Mock;
  status: jest.Mock;
} {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status, json }),
    }),
  } as ArgumentsHost;

  return { host, json, status };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('formats HttpException as an error envelope', () => {
    const { host, json, status } = mockHost();

    filter.catch(new BadRequestException('Invalid credentials'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid credentials',
      data: null,
    });
  });

  it('joins validation message arrays', () => {
    const { host, json, status } = mockHost();

    filter.catch(
      new HttpException(
        { message: ['email must be an email', 'password is too short'] },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'email must be an email, password is too short',
      data: null,
    });
  });

  it('formats unknown errors as 500', () => {
    const { host, json, status } = mockHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  });
});
