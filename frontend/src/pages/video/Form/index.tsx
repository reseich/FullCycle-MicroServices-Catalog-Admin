import * as React from 'react';
import {useEffect, useState} from 'react';
import {
    Checkbox,
    FormControlLabel,
    Grid,
    makeStyles,
    TextField,
    Theme, Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import * as yup from 'yup';
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {Video, VideoFileFieldsMap} from "../../../util/models";
import {DefaultForm} from "../../../Components/DefaultForm";
import {yupResolver} from "@hookform/resolvers/yup";
import videoHttp from "../../../util/http/videosHttp";
import {SubmitActions} from "../../../Components/SubmitActions";
import Rating from "../../../Components/Rating";
import RatingField from "./RatingField";


const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    }
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
    genres: yup.array()
        .label('Genres')
        .required(),
    categories: yup.array()
        .label('Categories')
        .required(),
    rating: yup.string()
        .label('Classification')
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);

export const Index = () => {
    const {
        handleSubmit,
        getValues,
        control,
        watch,
        trigger,
        reset,
        setValue,
        formState: {errors}
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            rating: '',
            year_launched: 0,
            duration: 0,
            opened: false,
            genres: [],
            categories: []
        },
        resolver: yupResolver(validationSchema)

    });

    const {id} = useParams() as any
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const classes = useStyles();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));


    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        videoHttp.get(id).then(({data}) => {
            setLoading(false)
            reset(data.data)
        }).catch(() => {
            setLoading(false)
            history.push('/videos')
            enqueueSnackbar('Video not found', {variant: 'error'})
        })
    }, [id, reset, enqueueSnackbar, history])

    function onSubmit(formData: any, event: any) {
        setLoading(true)
        const requestHttp = id ? videoHttp.update(id, formData) : videoHttp.create(formData)
        requestHttp.then(({data}) => {
            setLoading(false)
            enqueueSnackbar('Video save successful', {variant: 'success'})
            event ? (
                    id ? history.replace(`/videos/${data.data.id}/edit`) : history.push(`/videos/${data.data.id}/edit`)
                ) :
                history.push('/videos')
        }).catch((error) => {
            setLoading(false)
            enqueueSnackbar(error.message, {variant: 'success'})
        })
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

                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => {
                            setValue('rating', value)
                        }}
                        error={errors.rating}
                        FormControlProps={{margin: isGreaterMd ? 'none': 'normal'}}
                        disabled={loading}/>
                    <Controller
                        name="opened"
                        control={control}
                        render={({field: props}) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        {...props}
                                        checked={watch('opened')}
                                        disabled={loading}
                                        onChange={(e) => {
                                            setValue('opened', !getValues()['opened'])
                                        }
                                        }
                                    />
                                }
                                label={
                                    <Typography color={"primary"} variant={"subtitle2"}>
                                        Show this video on launch section.
                                    </Typography>
                                }
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <SubmitActions disabledButtons={loading} handleSave={async () => {
                await trigger();
                if (!errors.title) {
                    onSubmit(getValues(), null)
                }
            }}/>

        </DefaultForm>
    );
};