import * as React from 'react';
import {createRef, MutableRefObject, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    makeStyles,
    TextField,
    Theme,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import * as yup from 'yup';
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {CastMember, Category, Genre, Video, VideoFileFieldsMap} from "../../../util/models";
import {DefaultForm} from "../../../components/DefaultForm";
import {yupResolver} from "@hookform/resolvers/yup";
import videoHttp from "../../../util/http/videosHttp";
import {SubmitActions} from "../../../components/SubmitActions";
import RatingField from "./RatingField";
import UploadField from "./UploadField";
import GenreField, {GenreFieldComponent} from "./GenreField";
import CategoryField, {CategoryFieldComponent} from "./CategoryField";
import CastMemberField, {CastMemberFieldComponent} from "./CastMemberField";
import {omit, zipObject} from 'lodash';
import {InputFileComponent} from "../../../components/InputFile";
import useSnackbarFormError from "../../../hooks/useSnackbarFormError";
import LoadingContext from "../../../components/loading/LoadingContext";
import SnackbarUpload from "../../../components/SnackbarUpload";
import {useDispatch} from "react-redux";
import {FileInfo} from "../../../store/upload/types";
import {Creators} from '../../../store/upload';

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    },
}));

const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Title')
        .required()
        .max(255),
    description: yup.string()
        .label('Synopsis')
        .required(),
    year_launched: yup.number()
        .label('Year Launched')
        .required()
        .min(1980),
    duration: yup.number()
        .label('Duration')
        .required()
        .min(1),
    cast_members: yup.array()
        .label('Casts')
        .required(),
    genres: yup.array()
        .label('Genres')
        .required().test({
            message: 'Each Genre Must be chosen at least by one selected category',
            test(value: any) { //array genres [{name, categories: []}]
                return value.every(
                    (v: any) => v.categories.filter(
                        (cat: any) => this.parent.categories.map((c: any) => c.id).includes(cat.id)
                    ).length !== 0
                );
            }
        }),
    categories: yup.array()
        .label('Categories')
        .required(),
    rating: yup.string()
        .label('Classification')
        .required()
});


export const Index = () => {
    const {
        handleSubmit,
        getValues,
        control,
        watch,
        trigger,
        reset,
        setError,
        setValue,
        formState: {errors, submitCount}
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            rating: '',
            thumb_file: '',
            banner_file: '',
            trailer_file: '',
            video_file: '',
            year_launched: 0,
            duration: 0,
            opened: false,
            genres: [],
            cast_members: [],
            categories: []
        },
        resolver: yupResolver(validationSchema)

    });
    useSnackbarFormError(submitCount, errors);
    const fileFields = Object.keys(VideoFileFieldsMap);
    const {id} = useParams() as any
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const classes = useStyles();
    const [video, setVideo] = useState<Video | null>(null);
    const loading = useContext(LoadingContext);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(() => createRef()))
    ) as MutableRefObject<{ [key: string]: MutableRefObject<InputFileComponent> }>;
    const dispatch = useDispatch();

    const resetForm = useCallback((data: any) => {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);
    }, [reset])

    useEffect(() => {
        if (!id) {
            return
        }

        videoHttp.get(id).then(({data}) => {
            setVideo(data.data)
            resetForm(data.data)
        }).catch(() => {
            history.push('/videos')
            enqueueSnackbar('Video not found', {variant: 'error'})
        })
    }, [resetForm, id, reset, enqueueSnackbar, history])


    function onSubmit(formData: any, event: any) {
        const sendData: any = omit(
            formData,
            [...fileFields, 'cast_members', 'genres', 'categories']
        );
        sendData['cast_members_id'] = formData['cast_members'].map((cast_member: CastMember) => cast_member.id);
        sendData['categories_id'] = formData['categories'].map((category: Category) => category.id);
        sendData['genres_id'] = formData['genres'].map((genre: Genre) => genre.id);

        const http = !video
            ? videoHttp.create(sendData)
            : videoHttp.update(video.id, sendData);
        http.then(({data}) => {
            enqueueSnackbar('Video save successful', {variant: 'success'})
            uploadFiles(data.data);
            event
                ? (
                    id
                        ? history.replace(`/videos/${data.data.id}/edit`)
                        : history.push(`/videos/${data.data.id}/edit`)
                ) :
                history.push('/videos')
        }).catch((error) => {
            enqueueSnackbar(error.message, {variant: 'success'})
        })
    }

    function uploadFiles(video: any) {
        // @ts-ignore
        const files: FileInfo[] = fileFields
            // @ts-ignore
            .filter((fileField) => getValues()[fileField])
            // @ts-ignore
            .map(fileField => ({fileField, file: getValues()[fileField] as File}));

        if (!files.length) {
            return;
        }

        dispatch(Creators.addUpload({video, files}));

        enqueueSnackbar('', {
            key: 'snackbar-upload',
            persist: true,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            content: (key, message) => {
                const id = key as any;
                return <SnackbarUpload id={id}/>
            }
        });
    }

    return (
        <DefaultForm
            GridItemProps={{xs: 12}}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <Controller control={control} render={({field: props}) => (
                        <TextField
                            {...props}
                            type={'text'}
                            label={'Title'}
                            fullWidth
                            variant={'outlined'}
                            margin={'normal'}
                            disabled={loading}
                            error={!!errors.title}
                            helperText={errors.title && errors.title.message}
                            InputLabelProps={{shrink: true}}
                        />
                    )} name={'title'}/>

                    <Controller control={control} render={({field: props}) => (
                        <TextField
                            {...props}
                            label={'Synopsis'}
                            variant={'outlined'}
                            value={props.value || ''}
                            disabled={loading}
                            multiline
                            fullWidth
                            rows={4}
                            error={!!errors.description}
                            helperText={errors.description && errors.description.message}
                            InputLabelProps={{shrink: true}}
                        />
                    )} name={'description'}/>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Controller control={control} render={({field: props}) => (
                                <TextField
                                    {...props}
                                    type={'number'}
                                    label={'Year Launched'}
                                    fullWidth
                                    variant={'outlined'}
                                    margin={'normal'}
                                    disabled={loading}
                                    error={!!errors.year_launched}
                                    helperText={errors.year_launched && errors.year_launched.message}
                                    InputLabelProps={{shrink: true}}
                                />
                            )} name={'year_launched'}/>
                        </Grid>
                        <Grid item xs={6}>
                            <Controller control={control} render={({field: props}) => (
                                <TextField
                                    {...props}
                                    type={'number'}
                                    label={'Duration'}
                                    fullWidth
                                    variant={'outlined'}
                                    margin={'normal'}
                                    disabled={loading}
                                    error={!!errors.duration}
                                    helperText={errors.duration && errors.duration.message}
                                    InputLabelProps={{shrink: true}}
                                />
                            )} name={'duration'}/>
                        </Grid>
                    </Grid>
                    <CastMemberField
                        ref={castMemberRef}
                        castMembers={watch('cast_members')}
                        setCastMembers={(value) => setValue('cast_members', value)}
                        error={errors.cast_members}
                        disabled={loading}
                    />
                    <br/>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                ref={genreRef}
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value)}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value)}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                ref={categoryRef}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value)}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => {
                            setValue('rating', value)
                        }}
                        error={errors.rating}
                        FormControlProps={{margin: isGreaterMd ? 'none' : 'normal'}}
                        disabled={loading}/>
                    <br/>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Images
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['thumb_file']}
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['banner_file']}
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => {
                                    setValue('video_file', value)
                                }}
                            />
                        </CardContent>
                    </Card>
                    <br/>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="opened"
                                        color={'primary'}
                                        onChange={
                                            () => setValue('opened', !getValues()['opened'])
                                        }
                                        checked={watch('opened')}
                                        disabled={loading}
                                    />
                                }
                                label={
                                    <Typography color="primary" variant={"subtitle2"}>
                                        show this video on launch section.
                                    </Typography>
                                }
                                labelPlacement="end"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <SubmitActions disabledButtons={loading} handleSave={async () => {
                await trigger();
                if (!getValues().cast_members.length) {
                    setError('cast_members', {type: 'required', message: 'Field Required'})
                }
                if (!getValues()?.categories.length) {
                    setError('categories', {type: 'required', message: 'Field Required'})
                }
                if (!getValues()?.genres.length) {
                    setError('genres', {type: 'required', message: 'Field Required'})
                }

                if (!errors.title) {
                    onSubmit(getValues(), null)
                }
            }}/>

        </DefaultForm>
    );
};