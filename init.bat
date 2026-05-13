@echo off

echo ============================================
echo Creating Enterprise NestJS Architecture
echo ============================================

REM =====================================================
REM AUTH
REM =====================================================

call nest g controller auth/controllers/auth --no-spec
call nest g service auth/services/auth --no-spec

call nest g class auth/dto/login.dto --no-spec
call nest g class auth/dto/register.dto --no-spec

call nest g class auth/entities/user-auth.entity --no-spec

call nest g interface auth/interfaces/auth.interface --no-spec

REM =====================================================
REM USERS
REM =====================================================

call nest g controller users/controllers/users --no-spec
call nest g service users/services/users --no-spec

call nest g class users/dto/create-user.dto --no-spec
call nest g class users/dto/update-user.dto --no-spec

call nest g class users/entities/user.entity --no-spec

call nest g interface users/interfaces/user.interface --no-spec

REM =====================================================
REM PLOTS
REM =====================================================

call nest g controller plots/controllers/plots --no-spec
call nest g service plots/services/plots --no-spec

call nest g class plots/dto/create-plot.dto --no-spec
call nest g class plots/dto/update-plot.dto --no-spec

call nest g class plots/entities/plot.entity --no-spec

call nest g interface plots/interfaces/plot.interface --no-spec

REM =====================================================
REM NFT
REM =====================================================

call nest g controller nft/controllers/nft --no-spec
call nest g service nft/services/nft --no-spec

call nest g class nft/dto/create-nft.dto --no-spec
call nest g class nft/dto/mint-nft.dto --no-spec

call nest g class nft/entities/nft.entity --no-spec

call nest g interface nft/interfaces/nft.interface --no-spec

echo ============================================
echo Architecture Created Successfully
echo ============================================

pause