import {PrismaClient, User} from '@prisma/client';

export class UserRepository {

    private prisma = new PrismaClient();

    findAll = async () => {
        return this.prisma.user.findMany({
            orderBy: [{registrationTime: 'desc'}]
        });
    }

    findLoginById = async (userId: bigint) => {
        return this.prisma.user.findUnique({
            select: {login: true},
            where: {id: userId}
        })
    }

    findById = async (userId: bigint) => {
        return this.prisma.user.findUnique({
            where: {id: userId}
        })
    }

    findClientByLogin = async (login: string) => {
        return this.prisma.user.findUnique({
            where: {login, role: "CLIENT"}
        });
    }

    findByLogin = async (login: string) => {
        return this.prisma.user.findUnique({
            where: {login}
        });
    }

    create(user: Omit<User, 'id' | 'registrationTime' | 'about' | 'balance' | 'logs'>) {
        return this.prisma.user.create({data: user});
    }

    update(user: User) {
        return this.prisma.user.update({
            where: {
                id: user.id
            },
            data: user
        });
    }

    // return marksScore and marksAmount
    // usage for caches
    /*setOrUpdateMovieMark =
        async (movieId: number, userId: number, mark: number) : Promise<[marksScore: number, marksAmount: number]> => {
            const currentMark = await this.prisma.mark.findUnique(
                {where: {movieId_userId: {movieId: movieId, userId: userId} } }
            );

            if(currentMark){
                const updateScoreOn = mark - currentMark.value;
                await this.prisma.mark.update({
                    where: {
                        movieId_userId: {
                            movieId: currentMark.movieId,
                            userId: currentMark.userId
                        }
                    },
                    data: {value: mark}
                });
                const updatedMovie = await this.prisma.movie.update({
                    where: {id: movieId},
                    data: { marksScore: {increment: updateScoreOn}}
                });
                return [updatedMovie.marksScore, updatedMovie.marksAmount];
            } else {
                // TODO add @updateAt in scheme?
                await this.prisma.mark.create({
                    data: {
                        value: mark,
                        movie: {
                            connect: {id: movieId}
                        },
                        user: {
                            connect: {id: userId}
                        },
                    }
                });

                const updatedMovie = await this.prisma.movie.update({
                    where: {id: movieId},
                    data: {
                        marksScore: {increment: mark},
                        marksAmount: {increment: 1},
                    }
                });

                return [updatedMovie.marksScore, updatedMovie.marksAmount];
            }
        }*/
}

